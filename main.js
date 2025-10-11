
const selectListContainer = document.getElementById("select_list_container");

document.getElementById('qaBtn').addEventListener('click', function(){
    location.href = 'qaPage/qaPage.html';
});

document.getElementById('aiQaBtn').addEventListener('click', function(){
    location.href = 'https://chatgpt.com/';
});

document.getElementById('logoutBtn').addEventListener('click', async function() {
    if (window._mainPlayer) window._mainPlayer.destroy();
        if (window._miniPlayer) window._miniPlayer.destroy();
    try {
        const res = await fetch('/logout', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const result = await res.json();
        if (result.success) {
            alert('로그아웃 되었습니다.');
            window.location.href = '/index.html';
        } else {
            alert('로그아웃 실패: ' + (result.message || '알 수 없는 오류'));
        }
    } catch (err) {
        alert('서버 오류: ' + err.message);
    }
});

// isMaster flex 간격 유지하며 표시/숨김 처리
window.addEventListener('DOMContentLoaded', async function() {
    try {
        const res = await fetch('/getSessionInfo', {
            method: 'GET',
            credentials: 'include'
        });
        const data = await res.json();
        const masterDiv = document.getElementById('master');
        const isMaster = document.getElementById('isMaster');
        console.log(data);
        if (data.isMaster === 1) {
            masterDiv.style.backgroundColor = 'orange';
            isMaster.textContent = '선생님';
            isMaster.style.color = 'white';
        } else {
            masterDiv.style.backgroundColor = 'rgb(36, 128, 214)';
            isMaster.textContent = '학생';
            isMaster.style.color = 'black';
        }
    } catch (err) {
        
    }
    clearSelectListContainer('none','');
});


videoBtn.addEventListener('click', function(){

    //location.href = 'video.html';

    if(selectListContainer.style.display === 'flex'){
        //이미 표시 중이면 숨기기
        clearSelectListContainer('none','');
        return;
    }
    else{
        // 1. 데이터베이스에서 영상 목록 받아오기
    fetch(`/video/list`)
        .then(res => res.json())
        .then(videoList => {
            console.log("Video List fetched:", videoList);
            // 2. date 기준 내림차순 정렬
            videoList = videoList.sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
            console.log(videoList);

            // 3. select_list_container 초기화
            clearSelectListContainer('flex','video');


            // 4. 데이터 넣기
            videoList.forEach(video => {
                const div = document.createElement("div");
                div.className = "video_description";
                div.onclick = function() {
                    clearSelectListContainer('none','');
                    showInfo(video.title, video.id, video.miniid);
};
                div.innerHTML = `
                    <p class="video_title">${video.title}</p>
                    <p class="video_date">
                    ${new Date(video.date).toLocaleDateString()}</p>
                    `;

                    // end_date와 현재 날짜/시각 비교
                const now = new Date();
                const startDate = new Date(video.date); 
                console.log(now, startDate);
                if (now < startDate) {
                    div.classList.add('not_started'); // 이벤트 시작 전 클래스 추가
                    // 시작 전 문구 추가
                    const startLabel = document.createElement('div');
                    startLabel.textContent = '재생 불가';
                    startLabel.className = 'not_started_label';
                    div.prepend(startLabel); // div 맨 위에 추가
                }

            selectListContainer.appendChild(div);
            });

        })
        .catch(err => {
            alert('영상 목록 불러오기 실패: ' + err);
        });


    }
    console.log('end');
    
});

function clearSelectListContainer(display,value) {
    selectListContainer.innerHTML = '';
    selectListContainer.style.display = `${display}`;
    selectListContainer.dataset.value = `${value}`; 
}


function showInfo(title, videoId, miniid){
    const videoContainer = document.getElementById('content_container');
    videoContainer.innerHTML = `
        <div id="video_info" style="width:100%; height:70vh; display:flex; align-items:center; justify-content:center; flex-direction:column;">
            <h2 style="text-align: center;">${title}</h2>
            <p>영상 ID: ${videoId} | 수어 영상 ID: ${miniid}</p>
            <p>단팥빵입니다.</p>
            <button id="play_video_btn" onclick="showVideo('${title}', '${videoId}', '${miniid}')" ">영상 재생</button>
        </div>
    `;
}


function showVideo(title, videoId, miniid){
    const videoContainer = document.getElementById('content_container');
    videoContainer.innerHTML = `
        <div id="video_top_bar" style="width:100%; height:10vh; display:flex; align-items:center;">
            <h2 style="text-align: center;">${title}</h2>
            <button id="control_mini_video">수어 OFF</button>
        </div>
        <div id="main_video_wrapper" style="position:relative; width:90vw; height:90vh;">
            <iframe id="main_video" width="100%" height="100%"
                src="https://www.youtube.com/embed/${videoId}?enablejsapi=1"
                frameborder="0" allow="autoplay; encrypted-media" ></iframe>
            <iframe id="mini_video" width="100%" height="100%"
                src="https://www.youtube.com/embed/${miniid}?enablejsapi=1&mute=1"
                frameborder="0" allow="autoplay; encrypted-media" 
                style="position:absolute; right:0; bottom:0; z-index:10;">
            </iframe>
        </div>
    `;

    // 미니 비디오 표시/숨김 토글 기능
    setTimeout(() => {
        const miniVideoElem = document.getElementById('mini_video');
        const controlBtn = document.getElementById('control_mini_video');
        let miniVisible = true;
        controlBtn.addEventListener('click', function() {
            miniVisible = !miniVisible;
            if (miniVisible) {
                miniVideoElem.style.visibility = 'visible';
                controlBtn.textContent = '수어 OFF';
            } else {
                miniVideoElem.style.visibility = 'hidden';
                controlBtn.textContent = '수어 ON';
            }
        });
    }, 200);


    // YouTube IFrame API 로드 (최초 1회만)
    function loadYTAPIAndCreatePlayers() {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            document.body.appendChild(tag);
            window.onYouTubeIframeAPIReady = createPlayers;
        } else {
            createPlayers();
        }
    }

    // 플레이어 생성 및 동기화
    function createPlayers() {
        // 기존 플레이어 객체 제거
        if (window._mainPlayer) window._mainPlayer.destroy();
        if (window._miniPlayer) window._miniPlayer.destroy();
        // 새 플레이어 생성
        window._mainPlayer = new YT.Player('main_video', {
            events: {
                'onStateChange': syncMiniPlayer,
                'onPlaybackQualityChange': syncMiniPlayer,
                'onPlaybackRateChange': syncMiniPlayer
            }
        });
        window._miniPlayer = new YT.Player('mini_video',{
            events: {
                'onStateChange': function(event) {
                                    muteAll(event);
                                    syncMainPlayer(event);
                                },
                'onPlaybackQualityChange': syncMainPlayer,
                'onPlaybackRateChange': syncMainPlayer,
                'onVolumeChange': muteAll
            }
        });
    }

    function muteAll(event) {
            // 항상 음소거 유지
            if (!window._miniPlayer.isMuted()) {
                window._miniPlayer.mute();
            }
        }


    // 동기화 함수
    function syncMiniPlayer(event) {
        const mainPlayer = window._mainPlayer;
        const miniPlayer = window._miniPlayer;
        if (!mainPlayer || !miniPlayer) return;
        // 재생/일시정지 동기화
        if (event.data === YT.PlayerState.PLAYING) {
            miniPlayer.playVideo();
        } else if (event.data === YT.PlayerState.PAUSED) {
            miniPlayer.pauseVideo();
        }
        // 진행 상황 동기화
        const mainTime = mainPlayer.getCurrentTime();
        const miniTime = miniPlayer.getCurrentTime();
        if (Math.abs(mainTime - miniTime) > 1) {
            miniPlayer.seekTo(mainTime, true);
        }
        // 재생속도 동기화
        const mainRate = mainPlayer.getPlaybackRate();
        const miniRate = miniPlayer.getPlaybackRate();
        if (mainRate !== miniRate) {
            miniPlayer.setPlaybackRate(mainRate);
        }
    }

    function syncMainPlayer(event) {
        const mainPlayer = window._mainPlayer;
        const miniPlayer = window._miniPlayer;
        if (!mainPlayer || !miniPlayer) return;
        // 재생/일시정지 동기화
        if (event.data === YT.PlayerState.PLAYING) {
            mainPlayer.playVideo();
        } else if (event.data === YT.PlayerState.PAUSED) {
            mainPlayer.pauseVideo();
        }
        // 진행 상황 동기화
        const mainTime = mainPlayer.getCurrentTime();
        const miniTime = miniPlayer.getCurrentTime();
        if (Math.abs(mainTime - miniTime) > 1) {
            mainPlayer.seekTo(miniTime, true);
        }
        // 재생속도 동기화
        const mainRate = mainPlayer.getPlaybackRate();
        const miniRate = miniPlayer.getPlaybackRate();
        if (mainRate !== miniRate) {
            mainPlayer.setPlaybackRate(miniRate);
        }
    }

    // 영상 선택 시마다 API 및 플레이어 생성
    loadYTAPIAndCreatePlayers();


}

/*
function showVideo2(title, videoId, miniid){
    const videoContainer = document.getElementById('content_container');
    videoContainer.innerHTML = `
        <div id="video_top_bar" style="width:100%; height:10vh; display:flex; align-items:center;">
            <h2 style="text-align: center;">${title}</h2>
            <button id="control_mini_video">작은 영상 표시 안하기</button>
        </div>
        <div id="main_video_wrapper" style="position:relative; width:90vw; height:90vh;">
            <video id="main_video" width="100%" height="100%" controls>
                <source src="https://drive.google.com/uc?export=download&id=${videoId}" type="video/mp4">
            </video>
            <video id="mini_video" width="35%" height="35%" muted
                style="position:absolute; right:0; bottom:0; z-index:1000; border-radius:8px; pointer-events:none;">
                <source src="https://drive.google.com/uc?export=download&id=${miniid}" type="video/mp4">
            </video>
        </div>
    `;
}
*/

/*
const mainVideo = document.getElementById('main_video');
        const miniVideo = document.getElementById('mini_video');
        if (mainVideo && miniVideo) {
            miniVideo.muted = true;
            // main_video 재생 시 mini_video도 재생
            mainVideo.addEventListener('play', () => {
                miniVideo.play();
            });
            // main_video 일시정지 시 mini_video도 일시정지
            mainVideo.addEventListener('pause', () => {
                miniVideo.pause();
            });
        }*/