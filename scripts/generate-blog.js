const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const BLOG_DIR = path.join(__dirname, "../blogs");
const OUTPUT = path.join(__dirname, "../data/blog-index.json");

function generate() {
  const files = fs.readdirSync(BLOG_DIR);

  const posts = files
    .filter(f => f.endsWith(".md"))
    .map(file => {
      const content = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
      const { data } = matter(content);

      return {
        slug: file.replace(".md", ""),
        title: data.title || "Untitled",
        date: data.date || "",
        summary: data.summary || "",
        image: data.image || "/images/logo.png",
        file: `/blogs/${file}`
      };
    });

  fs.writeFileSync(OUTPUT, JSON.stringify(posts, null, 2));
  console.log("Blog index generated");
}

generate();