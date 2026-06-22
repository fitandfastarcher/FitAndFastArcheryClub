const fs = require("fs");
const path = require("path");

const GALLERY_DIR = path.join(__dirname, "../images/gallery");
const OUTPUT = path.join(__dirname, "../data/gallery-index.json");

function generate() {
  const files = fs.readdirSync(GALLERY_DIR);

  const images = files
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .map(file => ({
      image: `/images/gallery/${file}`,
      caption: file.replace(/\.[^/.]+$/, "")
    }));

  fs.writeFileSync(OUTPUT, JSON.stringify(images, null, 2));
  console.log("Gallery index generated");
}

generate();