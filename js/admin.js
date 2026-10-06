import { escutarTodasMusicas, salvarMusica, deletarMusica } from './functions.js';
import { escutarAutenticacao } from './auth.js';

const tableBody = document.getElementById('music-table-body');
const modal = document.getElementById('music-modal');
const form = document.getElementById('music-form');

let usuarioAtual = null;

document.addEventListener('DOMContentLoaded', () => {
  // Proteção de rota: redireciona para login se não estiver autenticado
  escutarAutenticacao((user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    usuarioAtual = user;

    escutarTodasMusicas((musicas) => {
      renderizarTabela(musicas);
    });
  });

  document.getElementById('btn-open-modal').addEventListener('click', () => {
    form.reset();
    modal.classList.add('active');
  });

  document.getElementById('btn-close-modal').addEventListener('click', () => modal.classList.remove('active'));
  document.getElementById('btn-cancel').addEventListener('click', () => modal.classList.remove('active'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!usuarioAtual) return;

    const dados = {
      titulo: document.getElementById('titulo').value,
      artista: document.getElementById('artista').value,
      estilo: document.getElementById('estilo').value,
      capaUrl: document.getElementById('capa-url').value,
      audioUrl: document.getElementById('audio-url').value,
      criadoPor: usuarioAtual.uid
    };

    await salvarMusica(dados);
    modal.classList.remove('active');
  });
});

function renderizarTabela(lista) {
  if (!tableBody) return;
  tableBody.innerHTML = '';

  lista.forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${m.capaUrl}" class="table-cover"></td>
      <td><strong>${m.titulo}</strong></td>
      <td>${m.artista}</td>
      <td>${m.estilo}</td>
      <td>
        <button class="btn-icon btn-delete"><i data-lucide="trash-2"></i></button>
      </td>
    `;

    tr.querySelector('.btn-delete').addEventListener('click', () => deletarMusica(m.id));
    tableBody.appendChild(tr);
  });

  if (window.lucide) lucide.createIcons();
}