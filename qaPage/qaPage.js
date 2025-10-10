const selectListContainer = document.getElementById("select_list_container");
const qaContentContainer = document.getElementById("qa-content-container");
const qaMessages = document.getElementById("qa-messages");
const qaWithName = document.getElementById("qa-with-name");

document.getElementById('qaBtn').addEventListener('click', function(){
    makeWhoToChat();
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
            masterDiv.style.backgroundColor = 'lightcoral';
            isMaster.textContent = '선생님';
            isMaster.style.color = 'white';
        } else {
            masterDiv.style.backgroundColor = 'lightgreen';
            isMaster.textContent = '학생';
            isMaster.style.color = 'black';
        }
    } catch (err) {
        
    }
    clearSelectListContainer('none','');
});


videoBtn.addEventListener('click', function(){

    location.href = '../main.html';
    
});

async function makeWhoToChat()
{
    document.getElementById('qaSendBtn').onclick = null;
    qaWithName.textContent = '';
    qaMessages.innerHTML = '';

    try {
        const res = await fetch('/chatUser', {
            method: 'GET',
            credentials: 'include'
        });
        const data = await res.json();
        console.log(data);
        if (Array.isArray(data.names)) {
            selectListContainer.innerHTML = ''; // 기존 내용 비우기
            data.names.forEach(name => {
                console.log(name);
                const btn = document.createElement('button');
                btn.textContent = name.name;
                btn.value = name.id;
                btn.onclick = () => startChat(name.id, name.name); // 함수 참조로 변경
                btn.className = 'chat-user-btn'; 
                selectListContainer.appendChild(btn);
            });
        }
    } catch (err) {
        console.error(' 질문 목록 불러오기 실패:', err);
    }
}

async function startChat(toId, toName){
    selectListContainer.innerHTML = '';

    document.getElementById('qaSendBtn').onclick = () => sendChat(toId);

    // 내 아이디 가져오기
    let myId;
    try {
        const sessionRes = await fetch('/getSessionInfo', { method: 'GET', credentials: 'include' });
        const sessionData = await sessionRes.json();
        myId = sessionData.userId;
    } catch (err) {
        alert('세션 정보를 불러올 수 없습니다.');
        return;
    }

    // 채팅 불러오기 함수
    async function loadChat() {
        try {
            const res = await fetch('/startChat', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fromId: myId, toId })
            });
            const data = await res.json();
            const chatArr = data.chats || data.results || [];
            // 상대방 이름 표시 (첫 메시지의 상대방 이름 사용)
            qaWithName.textContent = toName

            // 메시지 영역
            qaMessages.innerHTML = '';
            chatArr.forEach(chat => {
                const msgBox = document.createElement('div');
                msgBox.textContent = chat.content;
                msgBox.style.maxWidth = '60%';
                msgBox.style.margin = '8px 0';
                msgBox.style.padding = '8px 12px';
                msgBox.style.borderRadius = '12px';
                msgBox.style.wordBreak = 'break-all';
                if (chat.fromId === myId) {
                    // 내 메시지: 오른쪽
                    msgBox.style.background = '#d1e7dd';
                    msgBox.style.marginLeft = 'auto';
                    msgBox.style.textAlign = 'right';
                } else {
                    // 상대 메시지: 왼쪽
                    msgBox.style.background = '#fff';
                    msgBox.style.marginRight = 'auto';
                    msgBox.style.textAlign = 'left';
                }
                qaMessages.appendChild(msgBox);
            });
            // 스크롤 맨 아래로
            qaMessages.scrollTop = qaMessages.scrollHeight;
        } catch (err) {
            alert('채팅 불러오기 실패');
        }
    }

    // 최초 로딩
    await loadChat();

    // 5초마다 갱신
    if (window._chatInterval) clearInterval(window._chatInterval);
    window._chatInterval = setInterval(loadChat, 5000);
}


async function sendChat(toId){

    const input = document.getElementById('qa-input');
    const content = input.value.trim();
    if (!content) return;


    // 채팅 전송
    try {
        await fetch('/sendMessage', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                toId: toId,
                content
            })
        });
        input.value = ''; // 입력창 비우기
    } catch (err) {
        alert('메시지 전송 실패');
    }

}



document.addEventListener('DOMContentLoaded', function() {
    makeWhoToChat();
});