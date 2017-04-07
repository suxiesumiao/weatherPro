const CITIES_STORAGE = 'weatherPro'
let citiesStorge = {
    // 回取本地城市名称数据
    fetch: function() {
        let cities = JSON.parse(localStorage.getItem(CITIES_STORAGE))
        return cities
    },
    // 存储本地城市名称数据
    save: function(cities) {
        localStorage.setItem(CITIES_STORAGE, JSON.stringify(cities))
    }
}
let app = new Vue({
    el: '#app',
    data: {
        // 当前城市(默认城市)
        currentCity: '',
        // 如果城市组取不到默认就是Beijing
        cities: citiesStorge.fetch() || [{ 'name': 'Beijing' }],
        // 输入框输入的城市
        newCity: '',
        // 通用字符
        begin: 'http://api.openweathermap.org/data/2.5/',
        // openweathermap id
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
        hourlyWeatherData: [],
        // 周 中英表
        weekTable: {
            "Mon": "周一",
            "Tue": "周二",
            "Wed": "周三",
            "Thu": "周四",
            "Fri": "周五",
            "Sat": "周六",
            "Sun": "周天"
        },
        // 此时正处于oncategory
        onArrow: false,
        // 此时搜索框没有被拉下
        onSlideUp: false
    },
    // 观测cities的变化
    watch: {
        cities: {
            handler: function(cities) {
                citiesStorge.save(cities)
            },
            deep: true
        }
    },
    computed: {
        upperCaseHeader: function() {
            return this.currentCity
        }
    },
    // 方法
    methods: {
        // 找到当前城市组里的第一个城市
        getCurrentCity: function() {
            return this.cities[0].name
        },
        // 点击calendar按钮或是时间按钮转换显示内容
        changeTime: function() {
            this.isDaily = !this.isDaily
        },
        // 点击左上角按钮切换状态
        // 还包含控制侧边栏的显示隐藏功能
        cateOrArrow: function() {
            this.onArrow = !this.onArrow
        },
        // 获取周信息
        getWeek: function(number) {
            let tempTime = new Date(number * 1000)
            let week = tempTime.toDateString().split(' ')
            return {
                // 周名称
                weekName: this.weekTable[week[0]],
                // 日期
                date: week[1] + "-" + week[2],
                // 单个日期 几号
                singleDate: week[2],
                // 精确到几点发布
                presTime: tempTime.toLocaleTimeString()
            }
        },
        // 与analyArray 相关
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
        // 得到是第几天
        getDay: function(string) {
            return new Date(Number(string) * 1000).toString().split(' ')[2]
        },
        // 添加地点
        // 引起搜索框下拉
        addlocation: function() {
            this.onSlideUp = true
        },
        // 把搜索展示框提拉回去的动作
        backUp: function() {
            this.onSlideUp = false
        },
        // 增加城市
        addCity: function() {
            let cities = this.cities;
            // 检测是否有重复的地理名称
            // 如果有返回
            for (let i = 0; i < cities.length; i++) {
                if (cities[i].name === this.newCity.trim()) {
                    return
                }
            }
            // 首字母大写化
            let upperCase = this.newCity[0].toUpperCase()
                // 添加到第一位置
            cities.unshift({
                "name": this.newCity.replace(/^\w/gi, upperCase)
            })
            this.newCity = "";
            // 搜索增加的该城市的天气
            this.init()
        },
        // 删除一个城市
        deleteCity: function(index) {
            let length = this.cities.length
            if (length === 1) {
                return
            }
            for (let i = 0; i < length; i++) {
                if (index === i) {
                    this.cities.splice(i, 1)
                    break
                }
            }
            // 如果删除的不是处于第一位的城市 不必重新搜索
            if (this.currentCity !== this.cities[0].name) {
                this.init()
            }

        },
        // 程序入口 初始化
        init: function() {
            let that = this;
            that.currentCity = that.cities[0].name
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
                that.hourlyWeatherData = that.analyArray(response.data.list)
            })

        }
    },
    mounted: function() {
        this.init()
    }
})