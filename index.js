document.getElementById('loginBtn').addEventListener('click', async function() {

	const id = (document.getElementById('id_text').value || '').normalize('NFC');
	const password = (document.getElementById('pw_text').value || '').normalize('NFC');
	const res = await fetch('/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ id, password })
	});
	const data = await res.json();
	if (data.success) {
		window.location.href = './home.html';
	} else {
		alert('로그인 실패: ' + (data.message || '아이디 또는 비밀번호가 올바르지 않습니다.'));
		document.getElementById('id_text').value = '';
		document.getElementById('pw_text').value = '';
	}
});


document.addEventListener('click', function playAudioOnce() {
	const audio = document.getElementById('login-audio');
	if (audio) {
		audio.volume = 0.7; // 볼륨을 0.0~1.0 사이로 설정 (0.3은 약간 작은 소리)
		audio.play();
		// 한 번만 실행되도록 이벤트 제거
		document.removeEventListener('click', playAudioOnce);
	}
});