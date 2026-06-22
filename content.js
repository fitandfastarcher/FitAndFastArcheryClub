async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return res.text();
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return res.json();
}

function escapeHtml(text = "") {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

async function loadGallery() {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;

  try {
    const images = await fetchJson("/data/gallery-index.json");

    grid.innerHTML = images.map(item => `
      <div class="gallery-item">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.caption)}" loading="lazy">
        <div class="caption">${escapeHtml(item.caption)}</div>
      </div>
    `).join("");

    grid.classList.add("visible");

  } catch (err) {
    console.error(err);
    grid.innerHTML = "<p>Gallery failed to load.</p>";
  }
}

async function loadBlogList() {
  const grid = document.getElementById("blog-grid");
  if (!grid) return;

  try {
    const posts = await fetchJson("/data/blog-index.json");

    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    grid.innerHTML = posts.map(post => `
      <article class="blog-card">
        <div class="blog-card-image">
          <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}">
        </div>

        <div class="blog-card-body">
          <p class="blog-date">📅 ${escapeHtml(post.date)}</p>
          <h3>${escapeHtml(post.title)}</h3>
          <p>${escapeHtml(post.summary)}</p>

          <a href="blog-article.html?slug=${encodeURIComponent(post.slug)}" class="btn btn-gradient">
            Read More
          </a>
        </div>
      </article>
    `).join("");

    grid.classList.add("visible");

  } catch (err) {
    console.error(err);
    grid.innerHTML = "<p>Blogs failed to load.</p>";
  }
}

async function loadBlogArticle() {
  const container = document.getElementById("article-content");
  if (!container) return;

  const slug = new URLSearchParams(window.location.search).get("slug");

  if (!slug) {
    window.location.href = "blog.html";
    return;
  }

  try {
    const posts = await fetchJson("/data/blog-index.json");
    const post = posts.find(p => p.slug === slug);

    if (!post) {
      window.location.href = "blog.html";
      return;
    }

    const markdown = await fetchText(post.file);

    document.title = `${post.title} | Fit & Fast Archery Club`;

    const hero = document.getElementById("article-hero-title");
    if (hero) hero.textContent = post.title;

    container.innerHTML = `
      <div class="article-meta">
        <span>📅 ${post.date}</span>
        <span>✍️ ${post.author || "Fit & Fast Archery Club"}</span>
      </div>

      <img src="${post.image}" class="article-featured-img">

      <div class="markdown-body">
        ${marked.parse(markdown)}
      </div>

      <div class="article-actions">
        <a href="registration.html" class="btn btn-primary">Register</a>
        <a href="blog.html" class="btn btn-gradient">Back</a>
      </div>
    `;

    container.classList.add("visible");

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Article failed to load.</p>";
  }
}