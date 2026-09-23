function createEl(tag, options = {}) {
    const el = document.createElement(tag);
    if (options.className) el.className = options.className;
    if (options.text) el.textContent = options.text;
    if (options.html) el.innerHTML = options.html;
    if (options.src) el.src = options.src;
    if (options.alt) el.alt = options.alt;
    if (options.href) el.href = options.href;
    if (options.onclick) el.onclick = options.onclick;
    if (options.style) Object.assign(el.style, options.style);
    return el;
}

function createNav(navItems) {
    const nav = createEl('div', { className: 'floating-nav' });
    navItems.forEach(item => {
        const btn = createEl('div', { className: 'button' });
        const link = createEl('a', { href: item.href, text: item.text });
        btn.appendChild(link);
        nav.appendChild(btn);
    });
    return nav;
}

function createFooter() {
    const footer = createEl('div', { className: 'footer' });
    const content = createEl('div', { className: 'footer-content' });

    content.appendChild(createEl('p', { text: `© 2026 ${siteData.author}` }));

    const socialsDiv = createEl('div', { className: 'social-links' });
    socialsDiv.appendChild(createEl('span', { text: 'Соцсети:' }));
    siteData.socials.forEach((s, i) => {
        const link = createEl('a', { href: s.url, className: 'social-link', text: s.name });
        socialsDiv.appendChild(link);
        if (i < siteData.socials.length - 1) {
            socialsDiv.appendChild(document.createTextNode(' | '));
        }
    });
    content.appendChild(socialsDiv);

    const btnBlock = createEl('div', { className: 'footer-btn' });

    const snakeBtn = createEl('a', { href: 'snake.html', text: 'Играть в Змейку' });
    btnBlock.appendChild(snakeBtn);

    const minesweeperBtn = createEl('a', { href: 'minesweeper.html', text: 'Играть в Сапёра' });
    btnBlock.appendChild(minesweeperBtn);

    content.appendChild(btnBlock);

    const note = createEl('p', {
        className: 'footer-note',
        text: `Email: ${siteData.contacts.email} | Телефоны: ${siteData.contacts.phones.join(', ')}`
    });
    content.appendChild(note);

    footer.appendChild(content);
    return footer;
}

function createModal() {
    const overlay = createEl('div', { className: 'modal-overlay', id: 'imageModal' });
    const img = createEl('img', { id: 'modalImage', src: '', alt: 'Увеличенное фото' });
    overlay.appendChild(img);
    overlay.onclick = closeModal;
    return overlay;
}

function openModal(src) {
    document.getElementById('imageModal').classList.add('active');
    document.getElementById('modalImage').src = src;
    document.body.style.overflow = 'hidden';
}
function closeModal() {
    document.getElementById('imageModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});

// index.html

function renderHomePage() {
    const app = document.getElementById('app');

    app.appendChild(createNav(siteData.home.nav));

    const main = createEl('div', { className: 'main-content' });
    main.appendChild(createEl('h1', { className: 'name-hover', text: siteData.home.title }));

    const section = createEl('div', { className: 'student-section' });

    const info = createEl('div', { className: 'student-info' });
    siteData.home.info.forEach(text => {
        info.appendChild(createEl('p', { text: text }));
    });
    section.appendChild(info);

    const imgWrapper = createEl('div', { className: 'student-img-wrapper' });
    const img = createEl('img', {
        src: siteData.home.photo,
        alt: 'Фото студента'
    });
    img.onclick = () => openModal(img.src);
    imgWrapper.appendChild(img);
    section.appendChild(imgWrapper);

    main.appendChild(section);

    const bioSection = createEl('div', { className: 'bio-section' });
    siteData.home.bio.forEach(text => {
        bioSection.appendChild(createEl('p', { text: text }));
    });

    bioSection.appendChild(createAchievementsTable());

    bioSection.appendChild(createListBlock('skills', siteData.home.skills.title, siteData.home.skills.items));

    bioSection.appendChild(createProjectsBlock());

    bioSection.appendChild(createListBlock('personal-qualities', siteData.home.qualities.title, siteData.home.qualities.items));

    main.appendChild(bioSection);
    app.appendChild(main);

    app.appendChild(createModal());
    app.appendChild(createFooter());
}

function createAchievementsTable() {
    const block = createEl('div', { className: 'achievements' });
    block.appendChild(createEl('h3', { text: siteData.home.achievements.title }));

    const table = createEl('table', { className: 'achievements-table' });

    const thead = createEl('thead');
    const trHead = createEl('tr');
    trHead.appendChild(createEl('th', { text: 'Период' }));
    trHead.appendChild(createEl('th', { text: 'Достижение' }));
    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = createEl('tbody');
    siteData.home.achievements.rows.forEach(row => {
        const tr = createEl('tr');
        tr.appendChild(createEl('td', { text: row.period }));
        tr.appendChild(createEl('td', { text: row.text }));
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    block.appendChild(table);
    return block;
}

function createListBlock(className, title, items) {
    const block = createEl('div', { className: className });
    block.appendChild(createEl('h3', { text: title }));
    const ul = createEl('ul');
    items.forEach(item => {
        const li = createEl('li', { html: item });
        ul.appendChild(li);
    });
    block.appendChild(ul);
    return block;
}

function createProjectsBlock() {
    const block = createEl('div', { className: 'projects' });
    block.appendChild(createEl('h3', { text: siteData.home.projects.title }));
    const ul = createEl('ul');
    siteData.home.projects.items.forEach(p => {
        const li = createEl('li');
        li.appendChild(document.createTextNode(p.text + ' '));
        const link = createEl('a', { href: p.url, className: 'links', text: p.linkText });
        li.appendChild(link);
        ul.appendChild(li);
    });
    block.appendChild(ul);
    return block;
}

// science.html

function renderSciencePage() {
    const app = document.getElementById('app');

    app.appendChild(createNav(siteData.science.nav));

    const main = createEl('div', { className: 'main-content' });
    main.appendChild(createEl('h1', { text: siteData.science.title }));
    main.appendChild(createEl('p', { text: siteData.science.intro }));

    const ul = createEl('ul', { className: 'science-list' });
    siteData.science.interests.forEach(item => {
        ul.appendChild(createEl('li', { html: item }));
    });
    main.appendChild(ul);

    const extra = createEl('div', { className: 'science-extra' });
    extra.appendChild(createEl('h3', { text: siteData.science.extra.title }));
    const ulExtra = createEl('ul');
    siteData.science.extra.items.forEach(item => {
        ulExtra.appendChild(createEl('li', { text: item }));
    });
    extra.appendChild(ulExtra);
    main.appendChild(extra);

    const imagesDiv = createEl('div', { className: 'science-images' });
    siteData.science.images.forEach(src => {
        const wrapper = createEl('div', { className: 'science_img' });
        const img = createEl('img', { src: src, alt: 'Tech' });
        img.onclick = () => openModal(img.src);
        wrapper.appendChild(img);
        imagesDiv.appendChild(wrapper);
    });
    main.appendChild(imagesDiv);

    app.appendChild(main);
    app.appendChild(createModal());
    app.appendChild(createFooter());
}

//hobby.html

function renderHobbyPage() {
    const app = document.getElementById('app');

    app.appendChild(createNav(siteData.hobby.nav));

    const main = createEl('div', { className: 'main-content' });
    main.appendChild(createEl('h1', { text: siteData.hobby.title }));

    const ul = createEl('ul', { className: 'hobby-list' });
    siteData.hobby.list.forEach(item => {
        const li = createEl('li');
        li.appendChild(createEl('strong', { text: item.name }));

        item.images.forEach(src => {
            const wrapper = createEl('div', { className: 'hobby_img' });
            const img = createEl('img', { src: src, alt: item.name });
            img.onclick = () => openModal(img.src);
            wrapper.appendChild(img);
            li.appendChild(wrapper);
        });

        li.appendChild(createEl('p', { text: item.text }));
        ul.appendChild(li);
    });
    main.appendChild(ul);

    const extra = createEl('div', { className: 'hobby-extra' });
    extra.appendChild(createEl('h3', { text: siteData.hobby.extra.title }));
    extra.appendChild(createEl('p', { text: siteData.hobby.extra.text }));
    main.appendChild(extra);

    app.appendChild(main);
    app.appendChild(createModal());
    app.appendChild(createFooter());
}