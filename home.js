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
