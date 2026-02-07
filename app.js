const storageChannels = 'youtubeHubChannels';
const storageSaved = 'youtubeHubSaved';

const defaultFeed = [
    {
        id: 'feed-1',
        channel: 'Canal Tech+',
        title: 'Novidades no YouTube Studio para criadores',
        time: 'Hoje • 12:40',
        tag: 'Tutorial'
    },
    {
        id: 'feed-2',
        channel: 'Criadores em Foco',
        title: 'Checklist semanal para não perder uploads',
        time: 'Ontem • 18:15',
        tag: 'Inspiração'
    },
    {
        id: 'feed-3',
        channel: 'Pixel Lab',
        title: 'Review das melhores playlists para foco',
        time: '2 dias atrás • 09:20',
        tag: 'Review'
    }
];

const getStored = (key, fallback = []) => {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;
    try {
        return JSON.parse(stored);
    } catch (error) {
        return fallback;
    }
};

const saveStored = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

const buildFeed = () => {
    const channels = getStored(storageChannels);
    if (channels.length === 0) {
        return defaultFeed;
    }

    return channels.map(channel => ({
        id: `feed-${channel.id}`,
        channel: channel.name,
        title: `Novo vídeo de ${channel.name}`,
        time: 'Hoje • 10:00',
        tag: channel.tag
    }));
};

const updateStats = () => {
    const statChannels = document.getElementById('stat-channels');
    const statFeed = document.getElementById('stat-feed');
    const statSaved = document.getElementById('stat-saved');

    if (!statChannels || !statFeed || !statSaved) return;

    const channels = getStored(storageChannels);
    const saved = getStored(storageSaved);
    const feed = buildFeed();
    statChannels.textContent = channels.length;
    statFeed.textContent = feed.length;
    statSaved.textContent = saved.length;
};

const renderFeed = () => {
    const feedList = document.getElementById('feed-list');
    if (!feedList) return;

    const filterChannel = document.getElementById('filter-channel');
    const filterTag = document.getElementById('filter-tag');
    const filter = {
        channel: filterChannel?.value || '',
        tag: filterTag?.value || ''
    };

    const feed = buildFeed();
    const saved = getStored(storageSaved);
    const filtered = feed.filter(item => {
        if (filter.channel && item.channel !== filter.channel) return false;
        if (filter.tag && item.tag !== filter.tag) return false;
        return true;
    });

    feedList.innerHTML = '';

    if (filtered.length === 0) {
        feedList.innerHTML = '<p style="color: var(--muted);">Nenhum upload com esses filtros.</p>';
        updateStats();
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'feed-card';

        const meta = document.createElement('div');
        meta.className = 'feed-meta';
        meta.innerHTML = `<span>${item.channel}</span><span>${item.time}</span>`;

        const title = document.createElement('h3');
        title.textContent = item.title;

        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = item.tag;

        const actions = document.createElement('div');
        actions.className = 'video-actions';

        const saveButton = document.createElement('button');
        saveButton.type = 'button';
        const isSaved = saved.some(savedItem => savedItem.id === item.id);
        saveButton.textContent = isSaved ? 'Salvo' : 'Salvar';
        if (isSaved) {
            saveButton.classList.add('active');
        }
        saveButton.addEventListener('click', () => toggleSaved(item.id));

        actions.appendChild(saveButton);

        card.append(meta, title, tag, actions);
        feedList.appendChild(card);
    });

    updateStats();
};

const renderSaved = () => {
    const savedList = document.getElementById('saved-list');
    if (!savedList) return;

    const saved = getStored(storageSaved);
    savedList.innerHTML = '';

    if (saved.length === 0) {
        savedList.innerHTML = '<p style="color: var(--muted);">Você ainda não salvou nenhum vídeo.</p>';
        updateStats();
        return;
    }

    saved.forEach(item => {
        const card = document.createElement('div');
        card.className = 'video-item';

        const title = document.createElement('h4');
        title.textContent = item.title;

        const meta = document.createElement('div');
        meta.className = 'video-meta';
        meta.textContent = `${item.channel} • ${item.time}`;

        const actions = document.createElement('div');
        actions.className = 'video-actions';

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.textContent = 'Remover';
        removeButton.addEventListener('click', () => removeSaved(item.id));

        actions.appendChild(removeButton);

        card.append(title, meta, actions);
        savedList.appendChild(card);
    });

    updateStats();
};

const renderChannels = () => {
    const channelList = document.getElementById('channel-list');
    if (!channelList) return;

    const channels = getStored(storageChannels);
    channelList.innerHTML = '';

    if (channels.length === 0) {
        channelList.innerHTML = '<p style="color: var(--muted);">Adicione canais para personalizar seu feed.</p>';
        updateStats();
        return;
    }

    channels.forEach(channel => {
        const card = document.createElement('div');
        card.className = 'channel-item';

        const title = document.createElement('h4');
        title.innerHTML = `<a href="${channel.link}" target="_blank" rel="noreferrer">${channel.name}</a>`;

        const meta = document.createElement('div');
        meta.className = 'channel-meta';
        meta.textContent = `${channel.tag} • ${channel.link.replace('https://', '')}`;

        const actions = document.createElement('div');
        actions.className = 'channel-actions';

        const favoriteButton = document.createElement('button');
        favoriteButton.type = 'button';
        favoriteButton.textContent = channel.favorite ? '★ Favorito' : '☆ Favoritar';
        if (channel.favorite) {
            favoriteButton.classList.add('active');
        }
        favoriteButton.addEventListener('click', () => toggleFavorite(channel.id));

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.textContent = 'Remover';
        removeButton.addEventListener('click', () => removeChannel(channel.id));

        actions.append(favoriteButton, removeButton);

        card.append(title, meta, actions);
        channelList.appendChild(card);
    });

    updateStats();
};

const refreshFilterOptions = () => {
    const filterChannel = document.getElementById('filter-channel');
    if (!filterChannel) return;

    const channels = getStored(storageChannels);
    filterChannel.innerHTML = '<option value="">Todos</option>';
    channels.forEach(channel => {
        const option = document.createElement('option');
        option.value = channel.name;
        option.textContent = channel.name;
        filterChannel.appendChild(option);
    });
};

const addChannel = (data) => {
    const channels = getStored(storageChannels);
    channels.push({
        id: Date.now().toString(),
        name: data.name,
        link: data.link,
        tag: data.tag,
        favorite: false
    });
    saveStored(storageChannels, channels);
    renderChannels();
    refreshFilterOptions();
    renderFeed();
};

const toggleFavorite = (id) => {
    const channels = getStored(storageChannels).map(channel => {
        if (channel.id === id) {
            return { ...channel, favorite: !channel.favorite };
        }
        return channel;
    });
    channels.sort((a, b) => Number(b.favorite) - Number(a.favorite));
    saveStored(storageChannels, channels);
    renderChannels();
    renderFeed();
};

const removeChannel = (id) => {
    const channels = getStored(storageChannels).filter(channel => channel.id !== id);
    saveStored(storageChannels, channels);
    renderChannels();
    refreshFilterOptions();
    renderFeed();
};

const toggleSaved = (id) => {
    const saved = getStored(storageSaved);
    const feed = buildFeed();
    const found = feed.find(item => item.id === id);
    if (!found) return;

    const exists = saved.some(item => item.id === id);
    const updated = exists ? saved.filter(item => item.id !== id) : [...saved, found];
    saveStored(storageSaved, updated);
    renderSaved();
    renderFeed();
};

const removeSaved = (id) => {
    const saved = getStored(storageSaved).filter(item => item.id !== id);
    saveStored(storageSaved, saved);
    renderSaved();
    renderFeed();
};

const bindFeedFilters = () => {
    const applyFilter = document.getElementById('apply-filter');
    if (!applyFilter) return;

    applyFilter.addEventListener('click', () => {
        renderFeed();
    });
};

const bindChannelForm = () => {
    const channelForm = document.getElementById('channel-form');
    if (!channelForm) return;

    channelForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(channelForm);
        const name = formData.get('name').toString().trim();
        const link = formData.get('link').toString().trim();
        const tag = formData.get('tag').toString().trim();

        if (!name || !link) return;

        addChannel({ name, link, tag });
        channelForm.reset();
    });
};

const setActiveNav = () => {
    const page = document.body.dataset.page;
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });
};

const init = () => {
    setActiveNav();
    refreshFilterOptions();
    bindFeedFilters();
    bindChannelForm();
    renderFeed();
    renderSaved();
    renderChannels();
};

init();
