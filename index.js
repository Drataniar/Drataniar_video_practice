document.getElementById('loginBtn').addEventListener('click', async function() {
	const id = document.getElementById('id_text').value;
	const password = document.getElementById('pw_text').value;
	const res = await fetch('/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ id, password })
	});
	const data = await res.json();
	if (data.success) {
		window.location.href = 'main.html';
	} else {
		alert('로그인 실패: ' + (data.message || '아이디 또는 비밀번호가 올바르지 않습니다.'));
		document.getElementById('id_text').value = '';
		document.getElementById('pw_text').value = '';
	}
});
