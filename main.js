
const selectListContainer = document.getElementById("select_list_container");
const contentContainer = document.getElementById("content_container");


function toMain(){
    location.href = 'home.html';
}

function goToMain(type) {
    if (type === 'qa') {
        location.href = `/qaPage/qaPage.html`;
    }
    else{
        location.href = `main.html?type=${encodeURIComponent(type)}`;
    }
        
    }

const params = new URLSearchParams(window.location.search);
const type = params.get('type');

// type 값에 따라 분기 처리
if (type === 'notice') {
    contentContainer.innerHTML = '';
    contentContainer.innerHTML = `
        <div style="width:100%; height:70vh; display:flex; align-items:center; justify-content:center; flex-direction:column;">
            <h2 style="text-align: center;">공지사항</h2>
            <img src="./img/loginPage.jpg" alt="공지사항 이미지" style="max-width:70%; max-height:80%; height:auto; margin-bottom:20px;">
            <p>현재 공지사항이 없습니다.</p>
        </div>
    `;
    // 알림, 공지사항 관련 코드
} else if (type === 'video') {
    videoBtnClick();
}  else if (type === 'ai') {
    contentContainer.style.height = '85vh';
    contentContainer.style.backgroundImage = "url('./img/AIintro.jpg')";
    contentContainer.style.backgroundSize = 'contain'; // 사진 전체가 보이도록
    contentContainer.style.backgroundPosition = 'center';
    contentContainer.style.backgroundRepeat = 'no-repeat';
    contentContainer.style.backgroundColor = '#000'; // 남는 공간이 검정색으로 보이게(원하면 변경)
    contentContainer.onclick = function() {
        location.href = 'https://chatgpt.com/';
    };
} else if (type === 'sign') {
    signVideoBtnClick();
} else if (type === 'changePw') {
    contentContainer.innerHTML = `
        <div style="width:100%; height:70vh; display:flex; align-items:center; justify-content:center; flex-direction:column;">
            <h2 style="text-align: center;">비밀번호 변경</h2>
            <input id="pw" type="password" placeholder="현재 비밀번호" style="margin:10px; font-size:1.2em; padding:8px;">
            <input id="pw1" type="password" placeholder="새 비밀번호" style="margin:10px; font-size:1.2em; padding:8px;">
            <input id="pw2" type="password" placeholder="새 비밀번호 확인" style="margin:10px; font-size:1.2em; padding:8px;">
            <button id="changePwBtn" style="margin:10px; font-size:1.1em; padding:8px 20px;">비밀번호 변경</button>
        </div>
    `;
    document.getElementById('changePwBtn').onclick = async function() {
        const pw = document.getElementById('pw').value
        const pw1 = document.getElementById('pw1').value;
        const pw2 = document.getElementById('pw2').value;
        if (!pw || !pw1 || !pw2) {
            alert('비밀번호를 모두 입력하세요.');
            return;
        }
        if (pw1 !== pw2) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        try {
            const res = await fetch('/changePassword', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    oldPassword: pw,    
                    newPassword: pw1 
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('비밀번호가 성공적으로 변경되었습니다.');
                location.href = 'home.html';
            } else {
                alert('비밀번호 변경 실패: ' + (data.message || '오류'));
            }
        } catch (err) {
            alert('서버 오류: ' + err.message);
        }
    };
}

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


function videoBtnClick(){

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
                    showInfo(video.title, video.id, video.miniid, video.info);
                };
                div.innerHTML = `
                    <p class="video_title">${video.title}</p>
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
    
}

function clearSelectListContainer(display,value) {
    selectListContainer.innerHTML = '';
    selectListContainer.style.display = `${display}`;
    selectListContainer.dataset.value = `${value}`; 
}


function showInfo(title, videoId, miniid, info){
    const videoContainer = document.getElementById('content_container');
    videoContainer.innerHTML = `
        <div id="video_info" style="width:100%; height:70vh; display:flex; align-items:center; justify-content:center; flex-direction:column;">
            <h2 style="text-align: center;">${title}</h2>
            <p>${info}</p>
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





function signVideoBtnClick(){

    if(selectListContainer.style.display === 'flex'){
        //이미 표시 중이면 숨기기
        clearSelectListContainer('none','');
        return;
    }
    else{
        // 1. 데이터베이스에서 영상 목록 받아오기
    fetch(`/signVideo/list`)
        .then(res => res.json())
        .then(videoList => {
            console.log("Video List fetched:", videoList);

            // 3. select_list_container 초기화
            clearSelectListContainer('flex','video');

            const div = document.createElement("div");
                div.className = "video_description";
                div.onclick = function() {
                    clearSelectListContainer('none','');
                };
                div.innerHTML = `
                    <p>제과제빵 실습에 필요한 전공용어 중<br> 
                    수어 표현이 없는 단어를 대전직업능력개발원에서 자체 제작 후<br>
                    대전지역 청각 협회에 심의를 거처 교육을 목적으로 영상 제작</p>
                    <p>(영상으로 수어를 학습하세요)</p>`;
                div.classList.add('important_description');
            selectListContainer.appendChild(div);
            

            videoList.forEach(video => {
                const div = document.createElement("div");
                div.className = "video_description";
                div.onclick = function() {
                    clearSelectListContainer('none','');
                    showVideo2(video.title, video.id);
                };
                div.innerHTML = `
                    <p class="video_title">${video.title}</p>
                    `;

            selectListContainer.appendChild(div);
            });

        })
        .catch(err => {
            alert('영상 목록 불러오기 실패: ' + err);
        });


    }
    console.log('end');
    
}

function showVideo2(title, videoId){
    const videoContainer = document.getElementById('content_container');
    videoContainer.innerHTML = `
        <div id="video_top_bar" style="width:100%; height:10vh; display:flex; align-items:center;">
            <h2 style="text-align: center;">${title}</h2>
        </div>
        <div id="main_video_wrapper" style="position:relative; width:90vw; height:90vh;">
            <iframe id="main_video" width="100%" height="100%"
                src="https://www.youtube.com/embed/${videoId}?enablejsapi=1"
                frameborder="0" allow="autoplay; encrypted-media" ></iframe>
        </div>
    `;


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
        // 새 플레이어 생성
        window._mainPlayer = new YT.Player('main_video', {
            events: {
            }
        });
    }
    // 영상 선택 시마다 API 및 플레이어 생성
    loadYTAPIAndCreatePlayers();


}