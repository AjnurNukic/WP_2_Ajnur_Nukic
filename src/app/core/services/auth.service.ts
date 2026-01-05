import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  user,
  User
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  theme: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private router: Router = inject(Router);


  user$: Observable<User | null> = user(this.auth);
  currentUser: User | null = null;

  constructor() {
    this.user$.subscribe(user => {
      this.currentUser = user;
    });
  }


  async register(name: string, email: string, password: string, theme: string): Promise<void> {
    try {

      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      

      const userProfile: UserProfile = {
        uid: credential.user.uid,
        name: name,
        email: email,
        theme: theme,
        createdAt: new Date()
      };

      const userDocRef = doc(this.firestore, `users/${credential.user.uid}/profile/data`);
      await setDoc(userDocRef, userProfile);


      localStorage.setItem('userTheme', theme);


      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw this.handleAuthError(error);
    }
  }


  async login(email: string, password: string): Promise<void> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      

      await this.loadUserProfile(credential.user.uid);
      
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.error('Login error:', error);
      throw this.handleAuthError(error);
    }
  }


  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      localStorage.removeItem('userTheme');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }


  private async loadUserProfile(uid: string): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, `users/${uid}/profile/data`);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;
        localStorage.setItem('userTheme', profile.theme);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }


  getCurrentUser(): User | null {
    return this.currentUser;
  }


  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }


  private handleAuthError(error: any): Error {
    let message = 'Greška prilikom autentifikacije.';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'Email je već u upotrebi.';
        break;
      case 'auth/invalid-email':
        message = 'Neispravan email format.';
        break;
      case 'auth/weak-password':
        message = 'Lozinka mora imati najmanje 6 karaktera.';
        break;
      case 'auth/user-not-found':
        message = 'Korisnik ne postoji.';
        break;
      case 'auth/wrong-password':
        message = 'Pogrešna lozinka.';
        break;
    }
    
    return new Error(message);
  }
}