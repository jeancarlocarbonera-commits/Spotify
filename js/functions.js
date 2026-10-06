import { db } from './firebase-config.js';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  query, 
  where 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const musicasRef = collection(db, 'musicas');

// Salvar nova música no Firestore
export async function salvarMusica(dados) {
  try {
    await addDoc(musicasRef, dados);
  } catch (error) {
    console.error("Erro ao salvar música:", error);
  }
}

// Escutar TODAS as músicas em tempo real (para Músicas em Alta)
export function escutarTodasMusicas(callback) {
  return onSnapshot(musicasRef, (snapshot) => {
    const musicas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(musicas);
  });
}

// Escutar APENAS as músicas do usuário logado (para Sua Biblioteca)
export function escutarMinhasMusicas(userId, callback) {
  const q = query(musicasRef, where('criadoPor', '==', userId));
  
  return onSnapshot(q, (snapshot) => {
    const minhasMusicas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(minhasMusicas);
  });
}

// Apagar música do Firestore
export async function deletarMusica(id) {
  try {
    await deleteDoc(doc(db, 'musicas', id));
  } catch (error) {
    console.error("Erro ao deletar música:", error);
  }
}