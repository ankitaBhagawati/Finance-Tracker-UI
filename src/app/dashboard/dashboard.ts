import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  //Heading
  headingText = 'Track. Budget. Thrive.';
  displayedHeading: string = '';
  words: string[] = [];
  wordIndex = 0;

  animateHeading() {
    if (this.wordIndex < this.words.length) {
      this.displayedHeading +=
        (this.wordIndex > 0 ? ' ' : '') + this.words[this.wordIndex];
      this.wordIndex++;
      setTimeout(() => this.animateHeading(), 400);
    }
  }
  ngOnInit() {
    this.words = this.headingText.split(' ');
    this.animateHeading();
  }
}
