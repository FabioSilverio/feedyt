const storageChannels = 'youtubeHubChannels';
const storageSaved = 'youtubeHubSaved';
const storageApiKey = 'youtubeHubApiKey';

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

const getApiKey = () => localStorage.getItem(storageApiKey) || '';

const setApiKey = (value) => {
    if (!value) return;
    localStorage.setItem(storageApiKey, value);
};

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

    return channels.flatMap(channel => channel.videos || []);
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

    const feed = buildFeed().sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
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

        if (item.thumbnail) {
            const thumb = document.createElement('img');
            thumb.className = 'feed-thumb';
            thumb.src = item.thumbnail;
            thumb.alt = item.title;
            card.appendChild(thumb);
        }

        const meta = document.createElement('div');
        meta.className = 'feed-meta';
        meta.innerHTML = `<span>${item.channel}</span><span>${item.time}</span>`;

        const title = document.createElement('a');
        title.className = 'feed-title';
        title.href = item.url || '#';
        title.target = '_blank';
        title.rel = 'noreferrer';
        title.textContent = item.title;

        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = item.tag;

        const actions = document.createElement('div');
        actions.className = 'feed-actions';

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

const addChannel = async (data) => {
    const apiKey = getApiKey();
    if (!apiKey) {
        alert('Adicione sua API key na página de canais para buscar os vídeos.');
        return;
    }
    const channels = getStored(storageChannels);
    const channelId = await resolveChannelId(data.link, apiKey);
    if (!channelId) {
        alert('Não foi possível identificar o canal. Verifique o link.');
        return;
    }
    const videos = await fetchLatestVideos(channelId, apiKey, data.name);
    channels.push({
        id: Date.now().toString(),
        name: data.name,
        link: data.link,
        tag: data.tag,
        favorite: false,
        channelId,
        videos
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

const resolveChannelId = async (link, apiKey) => {
    let url;
    try {
        url = new URL(link);
    } catch (error) {
        return '';
    }

    const path = url.pathname.replace('/', '');

    if (path.startsWith('channel/')) {
        return path.split('channel/')[1];
    }

    if (path.startsWith('@')) {
        const handle = path.replace('@', '');
        const handleResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${handle}&key=${apiKey}`);
        const handleData = await handleResponse.json();
        return handleData.items?.[0]?.id || '';
    }

    if (path.startsWith('user/')) {
        const username = path.split('user/')[1];
        const userResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${username}&key=${apiKey}`);
        const userData = await userResponse.json();
        return userData.items?.[0]?.id || '';
    }

    const searchResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(link)}&key=${apiKey}`);
    const searchData = await searchResponse.json();
    return searchData.items?.[0]?.id?.channelId || '';
};

const fetchLatestVideos = async (channelId, apiKey, channelName) => {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=6&order=date&type=video&key=${apiKey}`);
    const data = await response.json();
    if (!data.items) return [];

    return data.items.map(item => ({
        id: item.id.videoId,
        channel: channelName,
        title: item.snippet.title,
        time: new Date(item.snippet.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        tag: 'Upload',
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails?.high?.url || '',
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));
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

const bindApiKeyForm = () => {
    const apiKeyInput = document.getElementById('api-key');
    const saveButton = document.getElementById('save-api-key');
    if (!apiKeyInput || !saveButton) return;

    apiKeyInput.value = getApiKey();
    saveButton.addEventListener('click', () => {
        const value = apiKeyInput.value.trim();
        if (!value) return;
        setApiKey(value);
        alert('API key salva! Agora adicione seus canais.');
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
    bindApiKeyForm();
    renderFeed();
    renderSaved();
    renderChannels();
};

init();
