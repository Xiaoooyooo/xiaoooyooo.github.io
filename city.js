
let getCityInfoBtn = document.querySelector("[value='Get']")
let cityCodeInput = document.getElementById('cityCode')
getCityInfoBtn.addEventListener('click',function(){
    let cityCode = cityCodeInput.value
    if(cityCode == '' || /^\d*?$/.test(cityCode) == false){
        alert('仅限数字，空白也不行')
        return
    }
    let url = `https://restapi.amap.com/v3/config/district?keywords=${cityCode}&subdistrict=1&extensions=all&key=44b3613c0d8c4e8bf9344b456b8706c2`
    let xhr = new XMLHttpRequest
    xhr.open("get",url)
    xhr.onload = function(){
        let res = JSON.parse(this.response).districts[0]
        // console.log(res)
        console.log("行政区名:",res.name)
        console.log(res.polyline)
    }
    xhr.send()
})