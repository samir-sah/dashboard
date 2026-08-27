const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('client/public/synera-logo.png')
  .pipe(new PNG({
    filterType: 4
  }))
  .on('parsed', function() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let idx = (this.width * y + x) << 2;
        
        let r = this.data[idx];
        let g = this.data[idx+1];
        let b = this.data[idx+2];
        
        // If it's very close to white, make it transparent
        if (r > 240 && g > 240 && b > 240) {
          this.data[idx+3] = 0; // alpha to 0
        }
      }
    }

    this.pack().pipe(fs.createWriteStream('client/public/synera-logo.png'));
  });
