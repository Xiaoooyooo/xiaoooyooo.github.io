(() => {
	let getCityInfoBtn = document.querySelector("[value='Check']")
	let cityCodeInput = document.getElementById('cityCode')
	let download = document.getElementById('download')
	getCityInfoBtn.addEventListener('click', function () {
		let cityCode = cityCodeInput.value
		if (cityCode == '' || /^\d*?$/.test(cityCode) == false) {
			alert('仅限数字，空白也不行')
			return
		}
		let url = `https://restapi.amap.com/v3/config/district?keywords=${cityCode}&subdistrict=1&extensions=all&key=44b3613c0d8c4e8bf9344b456b8706c2`
		let xhr = new XMLHttpRequest
		xhr.open("get", url)
		xhr.onload = function () {
			try {
				// console.log(JSON.parse(this.response))
				let res = JSON.parse(this.response).districts[0]
				// console.log(res)
				// console.log("行政区名:", res.name)
				// console.log(res.polyline)
				createCSVFile(res.polyline.split(';'), res.name)
			} catch (err) {
				alert('出错了，可能没有这个行政区的数据')
				throw err
			}
		}
		xhr.send()
	})
	let isTheFirstTime = true
	function createCSVFile(text, name) {
		let str = 'X,Y\n'
		text.forEach(el => {
			str += el + '\n'
		})
		let uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
		download.href = uri
		download.download = `${name}.csv`
		download.title = `${name}`
		if (!isTheFirstTime) {
			download.classList.add('downloadReadyAnimation')
			setTimeout(() => {
				download.classList.remove('downloadReadyAnimation')
			}, 500)
			return
		}
		isTheFirstTime = false
		download.classList.remove('downloadHide')
	}
})()