<template>
    <div class="containers" ref="content">
        <!--头部提交-->
        <el-header style="height: 40px">
            <el-button type="primary" @click="handSubmit" size="mini">立即提交</el-button>
        </el-header>
        <!--bpmn工作流-->
        <div class="canvas" ref="canvas"></div>
        <!--控制面板-->
        <div id="js-properties-panel-bpmn-modeler" class="panel"></div>
        <!--右侧菜单栏-->
        <div class="dialog-con">
            <el-form ref="form" :model="form" label-width="80px">
                <div v-if="userTask">
                    <el-form-item label="流程名称" prop="name">
                        <el-input v-model="form.name" @blur="handInput(form.name)"></el-input>
                    </el-form-item>
                    <el-form-item label="负责人" prop="scope">
                        <el-select v-model="form.scope" @change="handSelect" style="width: 100%" clearable filterable
                                   placeholder="请选择">
                            <el-option
                                    v-for="item in options"
                                    :key="item.id"
                                    :label="item.label"
                                    :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="候选人" prop="candidateUsers">
                        <el-select v-model="form.candidateUsers" multiple @change="handSelect" style="width: 100%"
                                   clearable
                                   filterable
                                   placeholder="请选择">
                            <el-option
                                    v-for="item in options"
                                    :key="item.id"
                                    :label="item.label"
                                    :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </div>
                <div v-if="sequenceFlow">
                    <el-form-item label="箭头" prop="type">
                        <el-select v-model="form.type" style="width: 100%" clearable filterable
                                   placeholder="请选择">
                            <el-option
                                    v-for="item in typeList"
                                    :key="item.id"
                                    :label="item.value"
                                    :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="符号" prop="sign">
                        <el-radio-group v-model="form.sign" style="width: 100%;" size="small">
                            <el-radio-button :label="item.id" v-for="(item,index) in signList" :key="index">
                                {{item.value}}
                            </el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="限制" prop="term">
                        <el-input v-model="form.term"></el-input>
                    </el-form-item>
                    <el-form-item label="操作">
                        <el-button type="primary" @click="submitFlow()" size="small">确认条件</el-button>
                        <el-button type="primary" @click="resetFlow()" size="small">清除条件</el-button>
                    </el-form-item>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script>
    // 引入相关的依赖
    // import BpmnModeler from 'bpmn-js/lib/Modeler'
    import propertiesPanelModule from 'bpmn-js-properties-panel'
    /*  //系统默认的右侧显示框
      import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda'*/
    // 自定义的 properties-panel内容 右侧显示框
    import propertiesProviderModule from './properties-panel-extension/provider/authority';
    // 引入描述文件 右侧显示框
    import authorityModdleDescriptor from './properties-panel-extension/descriptors/authority'

    //Provider
    import CamundaPropertiesProvider from "bpmn-js-properties-panel/lib/provider/camunda";
    //汉化
    import customTranslate from '@/utils/customTranslate/customTranslate';
    //自定义左侧组件
    import CustomModeler from './customModeler'
    //
    import {xmlStr} from '../utils/xmlStr'

    export default {
        name: '',
        components: {},
        // 生命周期 - 创建完成（可以访问当前this实例）
        created() {
        },
        // 生命周期 - 载入后, Vue 实例挂载到实际的 DOM 操作完成，一般在该过程进行 Ajax 交互
        mounted() {
            this.init()
        },
        data() {
            return {
                // bpmn建模器
                bpmnModeler: null,
                container: null,
                canvas: null,
                XML: null,//最新的xml字段
                elementShape: undefined,//当前操作的xml信息
                //以下是自定义右侧菜单的字段
                //弹出框
                form: {
                    name: undefined,//任务名称
                    scope: undefined,//任务的负责人
                    candidateUsers: [],//候选人
                    term: null,//箭头的期限
                    type: null,//箭头
                    sign: null,//符号
                },
                userTask: false,//控制任务选择框
                sequenceFlow: false,//控制箭头选择框
                options: [//任务
                    {
                        id: "1",
                        label: "admin"
                    },
                    {
                        id: "2",
                        label: "张三"
                    },
                    {
                        id: "112",
                        label: "李四"
                    },
                    {
                        id: "117",
                        label: "王五"
                    },
                ],
                //箭头
                typeList: [
                    {
                        id: 1,
                        value: '天数',
                        table: "leave.day",
                    },
                    {
                        id: 2,
                        value: '件数'
                    },
                    {
                        id: 3,
                        value: '分数'
                    },
                    {
                        id: 4,
                        value: '个数'
                    },
                    {
                        id: 5,
                        value: '年数'
                    },
                    {
                        id: 6,
                        value: '月数'
                    },
                    {
                        id: 7,
                        value: '日数'
                    }
                ],
                //运算符
                signList: [
                    {
                        id: 1,
                        value: '<',
                        table: "&lt;"
                    },
                    {
                        id: 2,
                        value: '<=',
                        table: "&lt;="
                    },
                    {
                        id: 3,
                        value: '=',
                        table: "="
                    },
                    {
                        id: 4,
                        value: '>',
                        table: "&gt;"
                    },
                    {
                        id: 5,
                        value: '>=',
                        table: ">="
                    },
                ],
            }
        },
        // 方法集合
        methods: {
            init() {
                // 获取到属性ref为“content”的dom节点
                this.container = this.$refs.content
                // 获取到属性ref为“canvas”的dom节点
                const canvas = this.$refs.canvas
                //汉化
                let customTranslateModule = {
                    translate: ['value', customTranslate]
                };
                // 建模
                this.bpmnModeler = new CustomModeler({
                    container: canvas,
                    //添加控制板
                    propertiesPanel: {
                        parent: '#js-properties-panel-bpmn-modeler'
                    },
                    additionalModules: [
                        //汉化
                        customTranslateModule,
                        // 右边的工具栏
                        propertiesPanelModule,//表示的是属性栏这个框, 就是告诉别人这里要有个属性栏;
                        propertiesProviderModule,//表示的是属性栏里的内容, 也就是点击不同的element该显示什么内容
                    ],
                    moddleExtensions: {
                        //Provider
                        camunda: CamundaPropertiesProvider,
                        //自定义右侧显示框
                        authority: authorityModdleDescriptor,
                    }
                })
                //设置bpmn居左 1/10
                this.bpmnModeler.get('canvas').scroll({ dx: window.innerWidth / 10, dy: 0 })
                this.$axios({
                    method: "get",
                    url: "http://192.168.1.34:7001/flow/bpmn/1",
                    // `headers`是要发送的自定义请求头
                    headers: {'Content-Type': 'multipart/form-data'}
                }).then(res => {
                    console.log("res", res)
                    this.createNewDiagram(res.data.data ? res.data.data : xmlStr)
                }).catch(error => {
                    console.log("error", error);
                })
            },
            //重置表单
            reset() {
                //弹出框
                this.form = {
                    name: undefined,
                    scope: undefined,
                    candidateUsers: [],
                    term: null,//箭头的期限
                    type: null,//箭头
                    sign: null,//箭头,
                }
                this.userTask = false
                this.sequenceFlow = false
                this.$refs["form"].resetFields();
            },
            //渲染xml
            createNewDiagram(bpmnXmlStr) {
                // 将字符串转换成图显示出来
                this.bpmnModeler.importXML(bpmnXmlStr, (err) => {
                    if (err) {
                        // console.error(err)
                    } else {
                        // 这里是成功之后的回调, 可以在这里做一系列事情
                        this.XML = bpmnXmlStr
                        // 监听 modeler
                        this.addModelerListener()
                        // 监听 element
                        this.addEventBusListener()
                    }
                })
            },
            // 监听 modeler
            addModelerListener() {
                const that = this;
                const events = ["shape.added", "element.updateLabel"];
                events.forEach(function (event) {
                    that.bpmnModeler.on(event, (e) => {
                        if (event === "shape.added") {
                            console.log("新增了shape");
                        } else if (event === "shape.move.end") {
                            console.log("移动了shape");
                        } else if (event === "shape.removed") {
                            console.log("删除了shape");
                        } else if (event === "element.updateLabel") {
                            console.log("element.updateLabel", e.element);
                        }
                    });
                });
            },
            // 监听 element
            addEventBusListener() {
                let that = this;
                const eventBus = that.bpmnModeler.get("eventBus");

                const eventTypes = [
                    "directEditing.activate",
                    "directEditing.complete",
                    "element.click",
                    "element.changed",
                ];
                eventTypes.forEach(function (eventType) {
                    eventBus.on(eventType, function (e) {
                        if (!e || !e.element) {
                            console.log("无效的e", e);
                            return;
                        }
                        if (!e || e.element.type == "bpmn:Process") return;
                        if (eventType === "element.changed") {
                            // that.elementChanged(e)
                        } else if (eventType === "element.click") {
                            console.log("点击element", e)
                            that.reset()
                            //获取当前操作的xml信息
                            const bpmnjs = that.bpmnModeler;
                            let elementRegistry = bpmnjs.get("elementRegistry");
                            let shape = e.element ? elementRegistry.get(e.element.id) : e.shape;
                            that.elementShape = shape
                            console.log("shape", e.element);
                            //任务节点
                            if (shape.type === "bpmn:UserTask") {
                                that.userTask = true
                                //给表单赋值
                                that.form.name = shape.businessObject.name
                                //负责人组
                                let attrs = shape.businessObject.$attrs
                                console.log("attrs", attrs);
                                let stringSttrs = JSON.stringify(attrs)
                                //负责人 如果选了 就设置
                                if (stringSttrs.includes("activiti:assignee") && !stringSttrs.includes("$")) {
                                    that.form.scope = attrs["activiti:assignee"]
                                }
                                //候选人 如果选了 就设置
                                if (stringSttrs.includes("activiti:candidateUsers") && !stringSttrs.includes("$")) {
                                    let arr = attrs["activiti:candidateUsers"]
                                    that.form.candidateUsers = arr.split(',')
                                }
                            } else
                                //箭头节点
                            if (shape.type === "bpmn:SequenceFlow") {
                                that.sequenceFlow = true
                                //如果有值就回显
                                if (shape.businessObject.conditionExpression) {
                                    let conditionExpression = shape.businessObject.conditionExpression.body
                                    let typeId = ""
                                    let typeString = ""
                                    let signId = ""
                                    let signString = ""
                                    //箭头
                                    let arr = that.typeList.filter(item => {
                                        return conditionExpression.includes(item.table)
                                    })
                                    // 取出箭头
                                    if (arr.length) {
                                        typeId = arr[0].id
                                        typeString = arr[0].table
                                    }
                                    //运算符
                                    let list = that.signList.filter(item => {
                                        return conditionExpression.includes(item.value)
                                    })
                                    // 取出运算符
                                    if (list.length) {
                                        if (list.length > 1) {
                                            let filter = list.filter(item => {
                                                return item.value.length > 1
                                            })
                                            signId = filter[0].id
                                            signString = filter[0].value
                                        } else {
                                            signId = list[0].id
                                            signString = list[0].value
                                        }
                                    }
                                    let a = conditionExpression.replace('${' + typeString + signString, "")
                                    let b = a.replace('}', "")
                                    //最后给form绑值
                                    that.form.type = typeId//箭头
                                    that.form.sign = signId//符号
                                    that.form.term = b//箭头的期限
                                }
                            } else {
                                that.sequenceFlow = false
                                that.userTask = false
                            }
                        } else if (eventType === "interactionEvents.updateHit") {
                            console.log("interactionEvents.updateHit", e.element);
                        } else if (eventType === "directEditing.complete") {
                            console.log("directEditing.complete", e.element);
                        }
                    });
                });
            },
            // 操作任务节点
            handInput(name) {
                let that = this
                //任务节点
                if (that.elementShape.type === "bpmn:UserTask") {
                    if (!name) {
                        return
                    }
                    const modeling = that.bpmnModeler.get("modeling");
                    modeling.updateProperties(that.elementShape, {
                        name: that.form.name,
                        isInterrupting: true,
                    });
                    //刷新xml
                    that.bpmnModeler.saveXML({format: true}, function (err, xml) {
                        that.XML = xml
                    });
                }
                //箭头节点 弃用
                if (that.elementShape.type === "bpmn:SequenceFlow") {
                    console.log("目前操作的是箭头节点")
                }
            },
            //操作任务节点
            handSelect() {
                let that = this
                //任务节点
                if (that.elementShape.type === "bpmn:UserTask") {
                    const modeling = that.bpmnModeler.get("modeling");
                    if (that.form.scope) {
                        modeling.updateProperties(that.elementShape, {
                            "activiti:assignee": that.form.scope,
                        });
                    }
                    if (that.form.candidateUsers && that.form.candidateUsers.length) {
                        modeling.updateProperties(that.elementShape, {
                            "activiti:candidateUsers": that.form.candidateUsers
                        });
                    }
                    //刷新xml
                    that.bpmnModeler.saveXML({format: true}, function (err, xml) {
                        that.XML = xml
                    });
                }
            },
            //箭头节点提交
            submitFlow() {
                let that = this
                if (that.form.type && that.form.sign && that.form.term) {
                    that.bpmnModeler.saveXML({format: true}, function (err, xml) {
                        let id = that.elementShape.id
                        let typeObj = that.typeList.filter(item => {
                            return that.form.type == item.id
                        })
                        let signObj = that.signList.filter(item => {
                            return that.form.sign == item.id
                        })
                        let value = '${' + typeObj[0].table + signObj[0].table + that.form.term + '}'
                        that.xmlStr2json(xml, id, value)
                    });
                } else {
                    that.$message({type: "warning", message: "请填写完整的条件"})
                }
            },
            //箭头节点重置
            resetFlow() {
                let that = this
                //获取xml
                that.bpmnModeler.saveXML({format: true}, function (err, xml) {
                    let id = that.elementShape.id
                    let obj = that.$x2js.xml2js(xml)
                    for (let item of obj.definitions.process.sequenceFlow) {
                        if (id == item._id) {
                            delete item.conditionExpression
                        }
                    }
                    let xmlBbj = that.$x2js.js2xml(obj)
                    //刷新xml页面
                    that.createNewDiagram(xmlBbj)
                });
            },
            /**
             * 箭头节点加权限
             * @param {Object} xml
             * @id {string} 当前操作的流程的id
             */
            xmlStr2json(xml, id, value) {
                let obj = this.$x2js.xml2js(xml)
                for (let item of obj.definitions.process.sequenceFlow) {
                    if (id == item._id) {
                        let flow = `<conditionExpression xmlns='http://www.omg.org/spec/BPMN/20100524/MODEL' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:type='tFormalExpression'>${value}</conditionExpression>`
                        Object.assign(item, this.$x2js.xml2js(flow))
                    }
                }
                let xmlBbj = this.$x2js.js2xml(obj)
                //刷新xml页面
                this.createNewDiagram(xmlBbj)
            },
            //提交服务器
            handSubmit() {
                console.log("提交前打印", this.XML)
                this.$axios({
                    method: "post",
                    url: "http://192.168.1.34:7001/flow/bpmn",
                    // `headers`是要发送的自定义请求头
                    headers: {'Content-Type': 'application/json;charset=UTF-8'},
                    data: {
                        xmlStr: this.XML,
                        deploymentName: "测试",
                        className: "PaymentRequest"
                    }
                }).then(res => {
                    ///打印得到的数据
                    console.log("res", res)
                    this.$message({type: 'success', message: "提交成功"})
                }).catch(error => {
                    this.$message({type: 'error', message: error})
                })
            }
        },
    }
</script>

<style scoped lang="less">
    .containers {
        background-color: #ffffff;
        width: 100%;
        height: calc(100vh - 52px);
        overflow: hidden;
    }

    .canvas {
        width: 100%;
        height: 100%;
        background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMTBoNDBNMTAgMHY0ME0wIDIwaDQwTTIwIDB2NDBNMCAzMGg0ME0zMCAwdjQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlMGUwZTAiIG9wYWNpdHk9Ii4yIi8+PHBhdGggZD0iTTQwIDBIMHY0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTBlMGUwIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+")
    }

    .panel {
        position: absolute;
        right: 0;
        top: 0;
        width: 280px;
    }

    .dialog-con {
        position: fixed;
        top: 5px;
        right: 0;
        width: 28%;
        height: calc(100vh - 52px);;
        box-shadow: 2px 2px 5px #000000;
        background: white;
        padding: 20px;
    }
</style>
