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
        // 如果本地localStorage没有存储城市数据 默认就是Chengdu等3个城市
        cities: citiesStorge.fetch() || [{
            'name': 'Chengdu',
            'isSelected': true
        }, {
            'name': 'Beijing',
            'isSelected': false
        }, {
            'name': 'Shanghai',
            'isSelected': false
        }],
        // 输入框输入的城市
        newCity: '',
        // 通用字符
        begin: 'https://api.openweathermap.org/data/2.5/',
        // openweathermap id
        id: '6b5537cd39eac5d2b02dce11bd27a9e4',
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
        // 侧边栏是否被拉出
        onArrow: true,
        // 搜索框是否被拉下
        onSlideUp: false,
        // 用于标记当前选择的城市的index序号
        currentCityIndex: 0
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
            // 在本地localstorage搜索处于选中状态的城市
            for (let i = 0; i < this.cities.length; i++) {
                if (this.cities[i].isSelected) {
                    this.currentCity = this.cities[i].name
                    this.currentCityIndex = i
                    break
                }
            }
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
        // 增加一个城市
        addCity: _.debounce(
            function() {
                // 添加一个城市不会有重新init的步骤
                // init都在deleteCity-selectCity以及程序初始化时候处理
                let cities = this.cities;

                // 检测是否有重复的地理名称
                // 如果有返回
                for (let i = 0; i < cities.length; i++) {
                    if (cities[i].name === this.newCity.trim()) {
                        return
                    }
                }
                // 添加城市数量上限是7个
                if (cities.length >= 7) {
                    return
                }
                // 首字母大写化
                let upperCase = this.newCity[0].toUpperCase();
                // 添加到第一位置
                cities.unshift({
                    "name": this.newCity.replace(/^\w/gi, upperCase),
                    'isSelected': false
                })
                this.newCity = "";
                // 添加一个城市之后原先定位的城市的index会增加一个
                this.currentCityIndex++
            }, 500
        ),
        // 删除一个城市
        deleteCity: function(index) {
            let length = this.cities.length;
            // 至少城市列表要有一个城市
            if (length === 1) { return }
            for (let i = 0; i < length; i++) {
                if (index === i) {
                    this.cities.splice(i, 1)
                    break
                }
            }
            // 如果当前要删除的城市正好是处于城市列表选中的城市 那么让第一个城市选中
            if (this.currentCityIndex === index) {
                this.currentCityIndex = 0
                this.currentCity = this.cities[0].name
                this.cities[0].isSelected = true;
                // 第一个城市被选中了 搜索
                this.init()
            }
            // 如果当前要删除的城市的index序号小于处于选中状态的城市的序号
            if (this.currentCityIndex > index) {
                this.currentCityIndex--;
                this.currentCity = this.cities[this.currentCityIndex].name
                this.init()
            }
            // 如果当前要删除的城市的index序号大于处于选中状态的城市的序号
            // 不会有初始化的要求
        },
        // 在城市列表中选中一个城市
        selectCity: function(index) {
            // 之前选中的城市变为非选中
            this.cities[this.currentCityIndex].isSelected = false;
            // 本城市被选中
            this.cities[index].isSelected = true;
            // currentCity更新
            this.currentCity = this.cities[index].name
            this.currentCityIndex = index;
            // 选中该城市后搜索该城市天气信息
            this.init()
        },
        // 刷新
        refresh: function() {
            this.init()
        },
        demask: function() {

        },
        // 程序入口 初始化
        init: function() {
            // 实时天气预报
            let currentUrl = `${this.begin}weather?q=${this.currentCity}&appid=${this.id}&units=metric&lang=zh_cn`
            let that = this;
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
        // 获取当前城市与搜索城市天气信息分开处理
        this.getCurrentCity();
        this.init()
    }
})