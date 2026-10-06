import { auth } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

export async function cadastrarUsuario(email, senha) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    return userCredential.user;
  } catch (error) {
    throw new Error(traduzirErroAuth(error.code));
  }
}

export async function logarUsuario(email, senha) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    return userCredential.user;
  } catch (error) {
    throw new Error(traduzirErroAuth(error.code));
  }
}

export async function deslogarUsuario() {
  await signOut(auth);
}

export function escutarAutenticacao(callback) {
  onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

function traduzirErroAuth(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Este e-mail já está em uso.';
    case 'auth/invalid-email':
      return 'E-mail inválido.';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    default:
      return 'Erro de autenticação. Tente novamente.';
  }
}