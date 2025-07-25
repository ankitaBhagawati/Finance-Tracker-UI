import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
 userName: string = '';

  constructor(private authService: AuthService) {}


  //Heading 
headingText = 'Track. Budget. Thrive.';
displayedHeading: string = '';
words: string[] = [];
wordIndex = 0;

animateHeading() {
  if (this.wordIndex < this.words.length) {
    this.displayedHeading += (this.wordIndex > 0 ? ' ' : '') + this.words[this.wordIndex];
    this.wordIndex++;
    setTimeout(() => this.animateHeading(), 400); 
  }
}
  ngOnInit() {
    const user = this.authService.getUserDetails();
    if (user) {
     const fullName = user.name ?? user.username ?? 'User';
     this.userName = fullName.split(' ')[0];
    }

      this.words = this.headingText.split(' ');
      this.animateHeading();
  }


}