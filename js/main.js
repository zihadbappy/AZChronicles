document.addEventListener("DOMContentLoaded", function() {
    const storiesListContainer = document.getElementById("story-items-container");
    const searchInput = document.getElementById("search-input");
    const activeFiltersContainer = document.getElementById("active-filters");

    let allStoriesData = [];
    const defaultThumbnail = "media/placeholder-thumbnail.png"; // Define default placeholder

    function createStoryItemHTML(story) {
        const tagsHTML = story.tags.map(tag => {
            const tagSlug = tag.toLowerCase().replace(/\s+/g, "-");
            return `<a href="#tag-${tagSlug}" class="tag-link">${tag}</a>`;
        }).join(", ");
        
        const storyThumbnail = story.thumbnail && story.thumbnail.trim() !== "" ? story.thumbnail : defaultThumbnail;

        return `
            <article class="story-item" data-title="${story.title.toLowerCase()}" data-tags="${story.tags.join(" ").toLowerCase()}" data-content="${story.snippet.toLowerCase()}">
                <div class="story-item-thumbnail-container">
                    <a href="_posts/${story.file}"><img src="${storyThumbnail}" alt="Thumbnail for ${story.title}" class="story-item-thumbnail"></a>
                </div>
                <div class="story-item-content">
                    <h3><a href="_posts/${story.file}">${story.title}</a></h3>
                    <p class="story-meta"><i class="fa-solid fa-calendar-week"></i> &nbsp; ${story.date} | &nbsp;&nbsp; <i class="fa-solid fa-tags"></i>&nbsp;  ${tagsHTML}</p>
                    <p>${story.snippet} <a href="_posts/${story.file}">Read more &rarr;</a></p>
                </div>
            </article>
        `;
    }

    function displayStories(storiesToDisplay, container) {
        if (!container) {
            return;
        }
        container.innerHTML = ""; 
        if (storiesToDisplay.length === 0) {
            container.innerHTML = "<p>No stories match your criteria.</p>";
            return;
        }
        storiesToDisplay.forEach(story => {
            container.innerHTML += createStoryItemHTML(story);
        });
        addTagLinkListeners(); 
    }

    function filterStories(searchTerm, tagFilter = null) {
        let filteredStories = [...allStoriesData];

        if (tagFilter) {
            tagFilter = tagFilter.toLowerCase();
            filteredStories = filteredStories.filter(story => 
                story.tags.map(t => t.toLowerCase().replace(/\s+/g, "-")).includes(tagFilter)
            );
            if (activeFiltersContainer) {
                activeFiltersContainer.innerHTML = `Filtering by tag: <strong>${tagFilter.replace(/-/g, " ")}</strong> <a href="#clear-filter" id="clear-tag-filter">(Clear)</a>`;
                document.getElementById("clear-tag-filter")?.addEventListener("click", (e) => {
                    e.preventDefault();
                    if (searchInput) {
                        filterStories(searchInput.value, null);
                    } else {
                        filterStories("", null);
                    }
                    if (activeFiltersContainer) activeFiltersContainer.innerHTML = "";
                    window.location.hash = "";
                });
            }
        } else {
             if (activeFiltersContainer) activeFiltersContainer.innerHTML = "";
        }
        
        const currentSearchTerm = searchTerm ? searchTerm.toLowerCase().trim() : "";

        if (currentSearchTerm !== "") {
            filteredStories = filteredStories.filter(story => {
                const title = story.title.toLowerCase().trim();
                const tagsString = story.tags.join(" ").toLowerCase();
                const snippet = story.snippet.toLowerCase().trim();
                return title.includes(currentSearchTerm) || 
                       tagsString.includes(currentSearchTerm) || 
                       snippet.includes(currentSearchTerm);
            });
        }
        
        if (storiesListContainer && (window.location.pathname.endsWith("index.html") || window.location.pathname.endsWith("/"))) {
            displayStories(filteredStories, storiesListContainer);
        }
    }

    function handleTagClick(event) {
        event.preventDefault();
        const clickedTag = event.target.closest(".tag-link");
        if (!clickedTag) return;

        const tagSlug = clickedTag.getAttribute("href").substring(5); 
        if (searchInput) {
            filterStories(searchInput.value, tagSlug);
        } else {
             filterStories("", tagSlug);
        }
        window.location.hash = `tag-${tagSlug}`;
    }

    function addTagLinkListeners() {
        const tagLinks = document.querySelectorAll(".tag-link");
        tagLinks.forEach(link => {
            link.removeEventListener("click", handleTagClick); 
            link.addEventListener("click", handleTagClick);
        });
    }

    fetch("js/stories.json")
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(stories => {
            allStoriesData = stories;

            if (storiesListContainer && (window.location.pathname.endsWith("index.html") || window.location.pathname.endsWith("/"))) {
                let initialTag = null;
                if (window.location.hash && window.location.hash.startsWith("#tag-")){
                    initialTag = window.location.hash.substring(5);
                }
                filterStories(searchInput ? searchInput.value : "", initialTag);
            }
            
            if (searchInput && (window.location.pathname.endsWith("index.html") || window.location.pathname.endsWith("/"))) {
                searchInput.addEventListener("keyup", function() {
                    let currentTagFilter = null;
                    if (window.location.hash && window.location.hash.startsWith("#tag-")) {
                        currentTagFilter = window.location.hash.substring(5);
                    }
                    filterStories(searchInput.value, currentTagFilter);
                });
            }
        })
        .catch(error => {
            console.error("Error fetching or processing stories:", error);
            if (storiesListContainer) storiesListContainer.innerHTML = "<p>Error loading stories. Please try again later.</p>";
        });

    const navLinks = document.querySelectorAll("header nav ul li a");
    const currentPathname = window.location.pathname;
    let currentBaseFilename = currentPathname.substring(currentPathname.lastIndexOf("/") + 1);

    if (currentBaseFilename === "" || currentPathname.endsWith("/")) {
        currentBaseFilename = "index.html";
    }
    const isStoryPage = currentPathname.includes("/_posts/");

    navLinks.forEach(link => {
        link.classList.remove("active");
        const linkHrefAttribute = link.getAttribute("href");

        let normalizedLinkTarget = linkHrefAttribute;
        if (isStoryPage && linkHrefAttribute.startsWith("../")) {
            normalizedLinkTarget = linkHrefAttribute.substring(3);
        }

        if (isStoryPage) {
            if (normalizedLinkTarget === "index.html") { 
                link.classList.add("active");
            }
        } else {
            if (normalizedLinkTarget === currentBaseFilename) {
                link.classList.add("active");
            }
        }
    });

    const zihadGithubURL = "https://github.com/your-github-username"; 
    const zihadEmail = "your.email@example.com"; 
    const githubLinkAbout = document.getElementById("github-link-about");
    const githubLinkContact = document.getElementById("github-link-contact");
    const emailLinks = document.querySelectorAll("a[href^=\"mailto:your.email@example.com\"]");

    if(githubLinkAbout) githubLinkAbout.href = zihadGithubURL;
    if(githubLinkContact) githubLinkContact.href = zihadGithubURL;
    emailLinks.forEach(emailLink => {
        if(emailLink) {
            emailLink.href = `mailto:${zihadEmail}`;
            if (emailLink.textContent.includes("your.email@example.com")) {
                 emailLink.textContent = zihadEmail;
            }
        }
    });

    window.addEventListener("hashchange", () => {
        if (window.location.pathname.endsWith("index.html") || window.location.pathname.endsWith("/")) {
            let currentTagFilter = null;
            if (window.location.hash && window.location.hash.startsWith("#tag-")) {
                currentTagFilter = window.location.hash.substring(5);
            }
            filterStories(searchInput ? searchInput.value : "", currentTagFilter);
        }
    });
});

