import { escutarTodasMusicas, escutarMinhasMusicas } from './functions.js';
import { escutarAutenticacao, deslogarUsuario } from './auth.js';

// Elementos da Interface
const gridContainer = document.getElementById('grid-container');
const libraryList = document.querySelector('.library-list');
const audioElement = document.getElementById('audio-element');
const btnMainPlay = document.getElementById('btn-main-play');
const playerTitle = document.getElementById('player-title');
const playerArtist = document.getElementById('player-artist');
const playerCover = document.getElementById('player-cover');
const playerPlaceholder = document.getElementById('player-placeholder');
const searchInput = document.getElementById('search-input');

// Elementos da Barra de Progresso e Volume
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const totalDurationEl = document.getElementById('total-duration');
const volumeBar = document.getElementById('volume-bar');

let usuarioLogado = null;
let todasAsMusicasCache = []; // Guarda a lista global para a pesquisa

document.addEventListener('DOMContentLoaded', () => {
  // Autenticação
  escutarAutenticacao((user) => {
    usuarioLogado = user;
    atualizarBotaoPerfil(user);

    // 1. Músicas em Alta (Geral)
    escutarTodasMusicas((todas) => {
      todasAsMusicasCache = todas;
      renderizarMusicasEmAlta(todasAsMusicasCache);
    });

    // 2. Sua Biblioteca (Exclusivo do usuário logado)
    if (user) {
      escutarMinhasMusicas(user.uid, (minhas) => {
        renderizarMinhaBiblioteca(minhas);
      });
    } else {
      renderizarMinhaBiblioteca([]);
    }
  });

  // --- FILTRO DE PESQUISA EM TEMPO REAL ---
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const termo = e.target.value.toLowerCase().trim();
      const filtradas = todasAsMusicasCache.filter(musica => 
        musica.titulo.toLowerCase().includes(termo) || 
        musica.artista.toLowerCase().includes(termo) ||
        (musica.estilo && musica.estilo.toLowerCase().includes(termo))
      );
      renderizarMusicasEmAlta(filtradas);
    });
  }

  // Botão Play/Pause Principal
  if (btnMainPlay) {
    btnMainPlay.addEventListener('click', alternarPlayPause);
  }

  // --- RECURSOS DO PLAYER ---

  // 1. Atualizar a barra e o tempo conforme a música toca
  if (audioElement) {
    audioElement.addEventListener('timeupdate', () => {
      if (audioElement.duration) {
        const percent = (audioElement.currentTime / audioElement.duration) * 100;
        if (progressBar) progressBar.value = percent;
        if (currentTimeEl) currentTimeEl.innerText = formatarTempo(audioElement.currentTime);
        if (totalDurationEl) totalDurationEl.innerText = formatarTempo(audioElement.duration);
      }
    });

    // Quando a música termina
    audioElement.addEventListener('ended', () => {
      atualizarIconePlayPause(false);
      if (progressBar) progressBar.value = 0;
      if (currentTimeEl) currentTimeEl.innerText = '0:00';
    });
  }

  // 2. Mudar o ponto da música ao arrastar a barra
  if (progressBar && audioElement) {
    progressBar.addEventListener('input', () => {
      if (audioElement.duration) {
        const seekTime = (progressBar.value / 100) * audioElement.duration;
        audioElement.currentTime = seekTime;
      }
    });
  }

  // 3. Controle de Volume
  if (volumeBar && audioElement) {
    volumeBar.addEventListener('input', () => {
      audioElement.volume = volumeBar.value / 100;
    });
  }
});

function atualizarBotaoPerfil(user) {
  const userActions = document.querySelector('.user-actions');
  if (!userActions) return;

  if (user) {
    userActions.innerHTML = `
      <a href="admin.html" class="badge">PAINEL ADMIN</a>
      <button id="btn-logout" class="badge" style="background: #222; border-color: #444; cursor: pointer;">SAIR</button>
    `;
    document.getElementById('btn-logout').addEventListener('click', () => deslogarUsuario());
  } else {
    userActions.innerHTML = `
      <a href="login.html" class="badge">ENTRAR</a>
    `;
  }
}

function renderizarMusicasEmAlta(lista) {
  if (!gridContainer) return;
  gridContainer.innerHTML = '';

  if (lista.length === 0) {
    gridContainer.innerHTML = `<p style="color: #888; font-size: 0.9rem; grid-column: 1 / -1; padding: 12px;">Nenhuma música encontrada.</p>`;
    return;
  }

  lista.forEach(musica => {
    const card = document.createElement('div');
    card.classList.add('spotify-card');

    card.innerHTML = `
      <div class="card-cover">
        <img src="${musica.capaUrl}" alt="${musica.titulo}">
      </div>
      <h3 style="font-size: 0.9rem; margin-top: 8px; color: #fff;">${musica.titulo}</h3>
      <p style="font-size: 0.75rem; color: #888;">${musica.artista}</p>
    `;

    card.addEventListener('click', () => tocarMusica(musica));
    gridContainer.appendChild(card);
  });
}

function renderizarMinhaBiblioteca(minhasMusicas) {
  if (!libraryList) return;
  libraryList.innerHTML = '';

  if (!usuarioLogado) {
    libraryList.innerHTML = `<p style="font-size: 0.8rem; color: #888; padding: 12px;"><a href="login.html" style="color:#e63946;">Faça login</a> para ver sua biblioteca.</p>`;
    return;
  }

  if (minhasMusicas.length === 0) {
    libraryList.innerHTML = `
      <div style="padding: 12px; color: #888; font-size: 0.8rem;">
        <p style="margin-bottom: 8px;">Sua biblioteca está vazia.</p>
        <a href="admin.html" style="color: var(--goth-blood, #e63946); text-decoration: underline;">+ Adicionar músicas no Painel Admin</a>
      </div>
    `;
    return;
  }

  minhasMusicas.forEach(musica => {
    const item = document.createElement('div');
    item.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
    `;

    item.innerHTML = `
      <img src="${musica.capaUrl}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
      <div style="overflow: hidden;">
        <div style="font-size: 0.85rem; font-weight: 600; color: #fff; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${musica.titulo}</div>
        <div style="font-size: 0.75rem; color: #888; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${musica.artista}</div>
      </div>
    `;

    item.addEventListener('mouseenter', () => item.style.background = 'rgba(255,255,255,0.05)');
    item.addEventListener('mouseleave', () => item.style.background = 'transparent');
    item.addEventListener('click', () => tocarMusica(musica));

    libraryList.appendChild(item);
  });
}

function tocarMusica(musica) {
  if (!audioElement) return;

  if (playerTitle) playerTitle.innerText = musica.titulo;
  if (playerArtist) playerArtist.innerText = musica.artista;
  
  if (musica.capaUrl && playerCover) {
    playerCover.src = musica.capaUrl;
    playerCover.style.display = 'block';
    if (playerPlaceholder) playerPlaceholder.style.display = 'none';
  }

  audioElement.src = musica.audioUrl;
  audioElement.load();

  audioElement.play().then(() => {
    atualizarIconePlayPause(true);
  }).catch((error) => {
    console.error("Erro ao tocar áudio:", error);
    alert("Não foi possível tocar esta música. Certifique-se de usar um link de áudio .mp3 direto!");
  });
}

function alternarPlayPause() {
  if (!audioElement || !audioElement.src) return;

  if (audioElement.paused) {
    audioElement.play();
    atualizarIconePlayPause(true);
  } else {
    audioElement.pause();
    atualizarIconePlayPause(false);
  }
}

// Troca o ícone com segurança e re-executa os ícones do Lucide
function atualizarIconePlayPause(tocando) {
  const playIcon = document.getElementById('play-icon');
  if (playIcon) {
    playIcon.setAttribute('data-lucide', tocando ? 'pause' : 'play');
    if (window.lucide) {
      lucide.createIcons();
    }
  }
}

function formatarTempo(segundos) {
  if (isNaN(segundos)) return "0:00";
  const min = Math.floor(segundos / 60);
  const seg = Math.floor(segundos % 60);
  return `${min}:${seg < 10 ? '0' : ''}${seg}`;
}