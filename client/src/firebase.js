import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyA5ciwvGbgCoVmZ2H9r5Z5rCzl699T6Q8E',
  authDomain: 'arrise-to-do-list-maker-df9b7.firebaseapp.com',
  projectId: 'arrise-to-do-list-maker-df9b7',
  storageBucket: 'arrise-to-do-list-maker-df9b7.firebasestorage.app',
  messagingSenderId: '258795495239',
  appId: '1:258795495239:web:508fd7fd34e9ca8df93662',
  measurementId: 'G-19ZZ5CM6GZ'
}

const app = initializeApp(firebaseConfig)
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null

export { app, analytics }
