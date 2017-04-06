let app = new Vue({
    el: '#app',
    data: {
        currentCity: 'Paris',
        begin: 'http://api.openweathermap.org/data/2.5/',
        id: '7c5219469d1d3aa869d2599559d26fc1',
        // 当前实时天气数据
        currentWeatherData: {
            main: {
                humidity: '',
                temp: '',
                pressure: ''
            },
            weather: [{
                main: ''
            }],
            wind: {
                speed: ''
            },
            clouds: {
                all: ''
            },
            dt: 0
        },
        // 是否显示每日天气数据
        // 默认只有两种天气显示
        isDaily: false,
        // 每日天气数据
        dailyWeatherData: {},
        // 每日实时天气数据
        hourlyWeatherData: []
    },
    computed: {

    },
    methods: {
        // 点击calendar按钮或是时间按钮转换显示内容
        changeTime: function() {
            this.isDaily = !this.isDaily
        },
        // 获取周信息
        getWeek: function(number) {
            let week = new Date(number * 1000).toDateString().split(' ')
            return {
                weekName: week[0],
                date: week[1] + "-" + week[2],
                singleDate: week[2]
            }
        },
        initArray: function(array, number) {
            return {
                hourly: [
                    array[number]
                ]
            }
        },
        // 分析每日小时数据
        analyArray: function(array) {
            let over = []
            let start = this.initArray(array, 0)
            over.push(start)
            for (let i = 1; i < array.length; i++) {
                if (this.getDay(array[i].dt) === this.getDay(array[i - 1].dt)) {
                    over[over.length - 1].hourly.push(array[i])
                } else {
                    over.push(this.initArray(array, i))
                }
            }
            return over
        },
        getDay: function(string) {
            return new Date(Number(string) * 1000).toString().split(' ')[2]
        },
        init: function() {
            let that = this;

            // 实时天气预报
            let currentUrl = `${this.begin}weather?q=${this.currentCity}&appid=${this.id}&units=metric&lang=zh_cn`
            axios.get(currentUrl).then(function(response) {
                that.currentWeatherData = response.data
            });

            // 每日天气预报
            let weekUrl = `${this.begin}forecast/daily?q=${this.currentCity}&appid=${this.id}&units=metric&lang=zh_cn&cnt=16`
            axios.get(weekUrl).then(function(response) {
                that.dailyWeatherData = response.data
            })

            // 每日小时天气预报
            let hourlyUrl = `${this.begin}forecast?q=${this.currentCity}&appid=${this.id}&units=metric&lang=zh_cn`
            axios.get(hourlyUrl).then(function(response) {
                that.dailyWeatherData = that.analyArray(response.data.list)
                console.log(that.dailyWeatherData)
            })

        }
    },
    mounted: function() {
        this.init()
    }
})