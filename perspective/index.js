(() => {
	let body = document.querySelector('body')
	let stage = document.querySelector('.stage')
	let cursor = {}
	document.onmousedown = function (e) {
		cursor.oldX = e.clientX
		cursor.oldY = e.clientY
		document.onmousemove = move
	}
	document.onmouseup = function (e) {
		document.onmousemove = null
		stopAnimation()
	}
	function stopAnimation() {
		cursor.minusY *= 0.95
		cursor.minusX *= 0.95
		X -= cursor.minusY
		Y += cursor.minusX
		rotate(X, Y)
		if (Math.abs(cursor.minusX) <= 0.05 && Math.abs(cursor.minusY) <= 0.05)
			return
		cursor.timer = requestAnimationFrame(arguments.callee)
	}
	let X = 0, Y = 0
	function move(e) {
		if (cursor.timer) cancelAnimationFrame(cursor.timer)
		cursor.newX = e.clientX
		cursor.newY = e.clientY
		cursor.minusX = cursor.newX - cursor.oldX
		cursor.minusY = cursor.newY - cursor.oldY
		X -= cursor.minusY * 0.2
		Y += cursor.minusX * 0.2
		rotate(X, Y)
		cursor.oldX = cursor.newX
		cursor.oldY = cursor.newY
	}
	function rotate(x, y) {
		stage.style.transform = `rotateX(${x}deg) rotateY(${y}deg)`
	}
})()