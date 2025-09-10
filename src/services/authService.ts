/**
 * Firebase Authentication Service
 *
 * Servicio modular para manejar todas las operaciones de autenticación con Firebase
 * Incluye login con Google, email/contraseña, registro y manejo de estado de usuarios
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
  AuthError,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, googleProvider, db } from '../firebase-config'

export interface UserData {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
  createdAt: Date
  lastLoginAt: Date
  hasPassword: boolean
  loginMethod: 'email' | 'google' | 'mixed'
}

export interface AuthResult {
  user: UserData
  isNewUser: boolean
  needsPasswordSetup: boolean
}

export class FirebaseAuthService {
  /**
   * Convierte un usuario de Firebase a nuestro formato UserData
   */
  private static async createUserData(
    firebaseUser: FirebaseUser,
    additionalData?: any,
  ): Promise<UserData> {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
    const userData = userDoc.data()

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      createdAt: userData?.createdAt?.toDate() || new Date(),
      lastLoginAt: new Date(),
      hasPassword: userData?.hasPassword || false,
      loginMethod: userData?.loginMethod || 'email',
      ...additionalData,
    }
  }

  /**
   * Guarda/actualiza los datos del usuario en Firestore
   */
  private static async saveUserToFirestore(
    user: UserData,
    isNewUser: boolean = false,
  ): Promise<void> {
    const userRef = doc(db, 'users', user.uid)

    if (isNewUser) {
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        hasPassword: user.hasPassword,
        loginMethod: user.loginMethod,
      })
    } else {
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
        emailVerified: user.emailVerified,
      })
    }
  }

  /**
   * Inicio de sesión con email y contraseña
   */
  static async signInWithEmail(
    email: string,
    password: string,
  ): Promise<AuthResult> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      )
      const userData = await this.createUserData(userCredential.user, {
        hasPassword: true,
        loginMethod: 'email',
      })

      await this.saveUserToFirestore(userData)

      return {
        user: userData,
        isNewUser: false,
        needsPasswordSetup: false,
      }
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  }

  /**
   * Registro con email y contraseña
   */
  static async signUpWithEmail(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<AuthResult> {
    try {
      const userCredential: UserCredential =
        await createUserWithEmailAndPassword(auth, email, password)
      const userData = await this.createUserData(userCredential.user, {
        hasPassword: true,
        loginMethod: 'email',
        displayName: displayName || null,
      })

      await this.saveUserToFirestore(userData, true)

      return {
        user: userData,
        isNewUser: true,
        needsPasswordSetup: false,
      }
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  }

  /**
   * Inicio de sesión con Google
   */
  static async signInWithGoogle(): Promise<AuthResult> {
    try {
      const userCredential: UserCredential = await signInWithPopup(
        auth,
        googleProvider,
      )
      const additionalUserInfo = (userCredential as any)._tokenResponse
      const isNewUser = additionalUserInfo?.isNewUser || false

      // Verificar si el usuario ya tiene contraseña establecida
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))
      const existingData = userDoc.data()
      const hasPassword = existingData?.hasPassword || false

      const userData = await this.createUserData(userCredential.user, {
        hasPassword,
        loginMethod: hasPassword ? 'mixed' : 'google',
      })

      await this.saveUserToFirestore(userData, isNewUser)

      return {
        user: userData,
        isNewUser,
        needsPasswordSetup: !hasPassword,
      }
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  }

  /**
   * Establecer contraseña para usuarios que se registraron con Google
   */
  static async setPassword(password: string): Promise<void> {
    if (!auth.currentUser) throw new Error('No hay usuario autenticado')

    try {
      await updatePassword(auth.currentUser, password)

      // Actualizar el estado en Firestore
      const userRef = doc(db, 'users', auth.currentUser.uid)
      await updateDoc(userRef, {
        hasPassword: true,
        loginMethod: 'mixed',
      })
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  }

  /**
   * Cerrar sesión
   */
  static async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  }

  /**
   * Enviar email de recuperación de contraseña
   */
  static async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  }

  /**
   * Obtener el usuario actual
   */
  static async getCurrentUser(): Promise<UserData | null> {
    if (!auth.currentUser) return null

    return await this.createUserData(auth.currentUser)
  }

  /**
   * Verificar si el usuario actual necesita establecer contraseña
   */
  static async currentUserNeedsPasswordSetup(): Promise<boolean> {
    if (!auth.currentUser) return false

    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
    const userData = userDoc.data()
    return !(userData?.hasPassword || false)
  }

  /**
   * Escuchar cambios en el estado de autenticación
   */
  static onAuthStateChanged(
    callback: (user: UserData | null) => void,
  ): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await this.createUserData(firebaseUser)
        callback(userData)
      } else {
        callback(null)
      }
    })
  }

  /**
   * Manejar errores de autenticación de Firebase
   */
  private static handleAuthError(error: AuthError): Error {
    let message = 'Error de autenticación'

    switch (error.code) {
      case 'auth/user-not-found':
        message = 'No existe una cuenta con este email'
        break
      case 'auth/wrong-password':
        message = 'Contraseña incorrecta'
        break
      case 'auth/email-already-in-use':
        message = 'Ya existe una cuenta con este email'
        break
      case 'auth/weak-password':
        message = 'La contraseña debe tener al menos 6 caracteres'
        break
      case 'auth/invalid-email':
        message = 'Email inválido'
        break
      case 'auth/popup-closed-by-user':
        message = 'Ventana de autenticación cerrada'
        break
      case 'auth/cancelled-popup-request':
        message = 'Solicitud de autenticación cancelada'
        break
      case 'auth/too-many-requests':
        message = 'Demasiados intentos. Intenta más tarde'
        break
      default:
        message = error.message || 'Error desconocido'
    }

    return new Error(message)
  }
}
