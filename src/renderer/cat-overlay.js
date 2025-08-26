// Cat Overlay - Elegant ASCII cat for CAT Terminal
class CatOverlay {
  constructor(container) {
    this.container = container;
    this.currentState = 'idle';
    this.animationFrame = 0;
    this.animationInterval = null;
    this.visible = true;
    
    // Beautiful ASCII cat art from the collection
    this.catFrames = {
      idle: [
        [
          "  |\\   /|  ",
          " ( o.o ) ",
          "  > ^ <  ",
          " /     \\ ",
          "(_)   (_)"
        ]
      ],
      typing: [
        [
          "  |\\   /|  ",
          " ( O.O ) ",
          "  > ! <  ",
          " /     \\ ",
          "(_)   (_)"
        ]
      ],
      thinking: [
        [
          "  |\\   /|  ?",
          " ( ?.? ) ?",
          "  > ~ <  ",
          " /     \\ ",
          "(_)   (_)"
        ]
      ],
      happy: [
        [
          "  |\\   /|  ",
          " ( ^.^ ) ",
          "  > w <  ",
          " /     \\ ",
          "(_)   (_)"
        ]
      ],
      sleeping: [
        [
          "  |\\   /|  Z",
          " ( -.^ ) z",
          "  > ~ <  Z",
          " /     \\ z",
          "(_)   (_)"
        ]
      ],
      surprised: [
        [
          "  |\\   /|  !",
          " ( O.O ) !!",
          "  > o <  !!!",
          " /     \\ ",
          "(_)   (_)"
        ]
      ],
      love: [
        [
          "  |\\   /|  ",
          " ( @.@ ) ",
          "  > <3<  ",
          " /     \\ ",
          "(_)   (_)"
        ]
      ],
      angry: [
        [
          "  |\\   /|  ",
          " ( >.< ) ",
          "  > v <  ",
          " /     \\ ",
          "(_)   (_)"
        ]
      ]
    };
    
    this.createElement();
    this.startAnimation();
    
    // Start idle timer
    this.onIdle();
  }
  
  createElement() {
    // Create overlay container positioned at bottom-right to watch typing
    this.overlayContainer = document.createElement('div');
    this.overlayContainer.id = 'cat-overlay-layer';
    this.overlayContainer.style.cssText = `
      position: fixed;
      bottom: 20px;  /* At bottom to watch typing */
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: opacity 0.3s ease;
      pointer-events: auto;
    `;
    
    // Add hover effect for transparency
    this.overlayContainer.addEventListener('mouseenter', () => {
      this.overlayContainer.style.opacity = '0.2';
    });
    
    this.overlayContainer.addEventListener('mouseleave', () => {
      this.overlayContainer.style.opacity = '0.8';
    });
    
    // Create the cat element
    this.element = document.createElement('div');
    this.element.className = 'cat-overlay';
    this.element.style.cssText = `
      position: relative;
      font-family: 'Courier New', monospace;
      font-size: 24px;
      line-height: 1.2;
      color: #999;
      user-select: none;
      pointer-events: none;
      white-space: pre;
      text-align: center;
      transition: all 0.3s ease;
      opacity: 0.8;
    `;
    
    // Create ASCII speech bubble for cat messages
    this.speechBubble = document.createElement('div');
    this.speechBubble.className = 'cat-speech';
    this.speechBubble.style.cssText = `
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 15px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #999;
      white-space: pre;
      display: none;
      text-align: center;
      line-height: 1;
    `;
    
    this.element.appendChild(this.speechBubble);
    
    // Add cat display area
    this.catDisplay = document.createElement('pre');
    this.catDisplay.style.margin = '0';
    this.element.appendChild(this.catDisplay);
    
    // Add to overlay container
    this.overlayContainer.appendChild(this.element);
    
    // Add overlay to body
    document.body.appendChild(this.overlayContainer);
  }
  
  setState(state, message = null) {
    if (this.catFrames[state]) {
      this.currentState = state;
      this.animationFrame = 0;
      
      // Show message if provided
      if (message) {
        this.showMessage(message);
      }
      
      // Update display immediately (no animation)
      this.updateDisplay();
    }
  }
  
  showMessage(text, duration = 3000) {
    // Create ASCII speech bubble
    const lines = text.split('\n');
    const maxLen = Math.max(...lines.map(l => l.length));
    const padding = 2;
    const bubbleWidth = Math.max(maxLen + padding * 2, 8);
    
    let bubble = '┌' + '─'.repeat(bubbleWidth) + '┐\n';
    
    lines.forEach(line => {
      const paddedLine = line.padStart(Math.floor((bubbleWidth + line.length) / 2)).padEnd(bubbleWidth);
      bubble += '│' + paddedLine + '│\n';
    });
    
    bubble += '└' + '─'.repeat(bubbleWidth) + '┘\n';
    bubble += ' '.repeat(Math.floor(bubbleWidth / 2)) + '▼';
    
    this.speechBubble.textContent = bubble;
    this.speechBubble.style.display = 'block';
    
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
    
    this.messageTimeout = setTimeout(() => {
      this.speechBubble.style.display = 'none';
    }, duration);
  }
  
  startAnimation() {
    // Static display - just show initial frame
    this.updateDisplay();
  }
  
  updateDisplay() {
    const frames = this.catFrames[this.currentState];
    if (!frames || frames.length === 0) return;
    
    // Always show first frame (static display)
    const currentFrame = frames[0];
    
    // Update display
    this.catDisplay.textContent = currentFrame.join('\n');
  }
  
  // React to terminal events
  onUserTyping() {
    if (this.currentState !== 'typing') {
      this.setState('typing');
      
      // Random typing messages (judgy and sassy)
      const messages = [
        "Keep going...",
        "Ummmm",
        "Uhhhh",
        "That's...",
        "uh huh"
      ];
      
      if (Math.random() < 0.005) { // 0.5% chance to show message (very rare)
        this.showMessage(messages[Math.floor(Math.random() * messages.length)], 2000);
      }
      
      // Reset to idle after a longer delay
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }
      
      this.typingTimeout = setTimeout(() => {
        this.setState('idle');
        this.onIdle(); // Start idle timer
      }, 5000); // 5 seconds
    }
  }
  
  onCommandExecuted(command) {
    // React to specific commands
    if (command.includes('cat')) {
      this.setState('love', '♥');
    } else if (command.includes('error') || command.includes('fail')) {
      this.setState('surprised', 'Yikes');
    } else if (command.includes('help')) {
      this.setState('thinking', 'Hmm...');
    } else if (command.includes('clear') || command.includes('cls')) {
      this.setState('happy', 'All gone!');
    } else if (command.includes('exit')) {
      this.setState('sleeping', "Goodbye...");
    } else if (command.includes('hello') || command.includes('hi')) {
      this.setState('happy', "Meow.");
    }
    
    // Return to idle after 5 seconds
    setTimeout(() => {
      this.setState('idle');
      this.onIdle(); // Start idle timer
    }, 5000);
  }
  
  onError(errorText) {
    // React to terminal errors with anger (only 10% of the time)
    if (Math.random() < 0.1) {
      const errorMessages = [
        "Lock in!",
        "Really?",
        "Come on...",
        "Seriously?",
        "Try again.",
        "Nope.",
        "Fix it.",
        "Ugh."
      ];
      
      const message = errorMessages[Math.floor(Math.random() * errorMessages.length)];
      this.setState('angry', message);
      
      // Stay angry for longer than normal reactions
      setTimeout(() => {
        this.setState('idle');
        this.onIdle(); // Start idle timer
      }, 8000);
    }
  }
  
  onIdle() {
    // After 2 minutes of no activity, cat falls asleep
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
    }
    
    this.idleTimeout = setTimeout(() => {
      this.setState('sleeping', 'Zzz...');
    }, 120000); // 2 minutes
  }
  
  toggle(visible) {
    this.visible = visible;
    this.overlayContainer.style.display = visible ? 'flex' : 'none';
    if (!visible && this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    } else if (visible && !this.animationInterval) {
      this.startAnimation();
    }
  }
  
  show() {
    this.toggle(true);
    this.setState('happy', "I'm back!");
    setTimeout(() => this.setState('idle'), 2000);
  }
  
  hide() {
    this.setState('sleeping', "See you later!");
    setTimeout(() => this.toggle(false), 1500);
  }
  
  dispose() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
    }
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
    this.overlayContainer.remove();
  }
}

// Export for use in main app
window.CatOverlay = CatOverlay;