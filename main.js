let songs = []; // Define songs globally

async function getSongs(folder) {
    try {
        currFolder = folder;
        let response = await fetch(`http://127.0.0.1:5500/${folder}/`);
        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let as = div.getElementsByTagName("a");
        songs = [];
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith("mp3")) {
                let songName = element.href.split(`/${folder}/`)[1]; // Adjusted split to "/songs/"
                if (songName) {
                    songs.push(songName.split("%20").join(" ")); // Replace "%20" with space
                }
            }
        }
        return songs;
    } catch (error) {
        console.error('Error fetching songs:', error);
        return [];
    }
}

// Rest of the code remains the same


let currentSong = new Audio();
let currFolder;

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track; // Corrected the path
    if (!pause) {
        currentSong.play();
        play.src = "/resources/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

function convertSecondsToMinutes(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function main() {
    await updateSongList("songs/pritiam-song");

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "/resources/pause.svg";
        } else {
            currentSong.pause();
            play.src = "/resources/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        if (!isNaN(currentSong.duration)) {
            document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(Math.floor(currentSong.currentTime))} / ${convertSecondsToMinutes(Math.floor(currentSong.duration))}`;
            document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    currentSong.addEventListener("loadedmetadata", () => {
        if (!isNaN(currentSong.duration)) {
            document.querySelector(".songtime").innerHTML = `00:00 / ${convertSecondsToMinutes(Math.floor(currentSong.duration))}`;
        }
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    });

    previous.addEventListener("click", () => {
        console.log("previous clicked");
        console.log("Current song:", currentSong.src);
        let currentSongURL = currentSong.src.split("/").slice(-1)[0].replace(/%20/g, " ");
        let index = songs.findIndex(song => song.endsWith(currentSongURL));
        console.log("Index of current song:", index);
        if ((index - 1) >= 0) {
            console.log("Previous song:", songs[index - 1]);
            playMusic(songs[index - 1]);
        } else {
            console.log("No previous song available.");
        }
    });

    next.addEventListener("click", () => {
        console.log("next clicked");
        console.log("Current song:", currentSong.src);
        let currentSongURL = currentSong.src.split("/").slice(-1)[0].replace(/%20/g, " ");
        let index = songs.findIndex(song => song.endsWith(currentSongURL));
        console.log("Index of current song:", index);
        if ((index + 1) < songs.length) {
            console.log("Next song:", songs[index + 1]);
            playMusic(songs[index + 1]);
        } else {
            console.log("No next song available.");
        }
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to", e.target.value, "/100");
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log(item.currentTarget.dataset.folder);
            await updateSongList(`songs/${item.currentTarget.dataset.folder}`);
        });
    });

    // Add event listeners for card1 elements
    Array.from(document.getElementsByClassName("card1")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log(item.currentTarget.dataset.folder);
            await updateSongList(`songs/${item.currentTarget.dataset.folder}`);
        });
    });
}

async function updateSongList(folder) {
    let songs = await getSongs(folder);
    console.log(songs);
    playMusic(songs[0], true);

    if (!songs.length) {
        console.error('No songs found.');
        return;
    }

    let songUL = document.querySelector(".songList ul");
    if (songUL) {
        songUL.innerHTML = ''; // Clear the existing song list
        songs.forEach(song => {
            if (song) {
                songUL.innerHTML += `<li><img class="invert" src="/resources/music.svg" alt="" srcset="">
                <div class="info">
                    <div>${song}</div>
                    <div>Raj</div>
                 </div>
                <div class="playnow">
                    <span>Play Now </span>
                    <img class="invert" src="/resources/play.svg" alt="">
                </div>
                </li>`;
            }
        });

        Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", element => {
                playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
            });
        });
    } else {
        console.error('Song list element not found.');
    }
}

main();
