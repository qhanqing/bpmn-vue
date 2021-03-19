<template>
    <div class="containers" ref="content">
        <div class="canvas" ref="canvas"></div>
        <div id="js-properties-panel" class="panel"></div>
        <div class="dialog-con">
            <el-form ref="form" :model="form" label-width="80px">
                <el-form-item label="流程名称">
                    <el-input v-model="form.name" @blur="handInput"></el-input>
                </el-form-item>
                <el-form-item label="负责人" prop="region">
                    <el-select v-model="form.scope" @change="handSelect" style="width: 100%" clearable filterable placeholder="请选择">
                        <el-option
                                v-for="item in options"
                                :key="item.id"
                                :label="item.label"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handSubmit">立即提交</el-button>
                </el-form-item>
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
                XML: null,
                //弹出框
                form: {
                    name: undefined,
                    term: undefined,
                    scope: undefined,
                },
                options: [
                    {
                        id: "1",
                        label: "admin"
                    },
                    {
                        id: "2",
                        label: "张三"
                    }
                ],
                elementShape: undefined,//当前操作的xml信息
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
                        parent: '#js-properties-panel'
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
                this.$axios({
                    method: "get",
                    url: "http://192.168.1.34:7001/flow/bpmn",
                    // `headers`是要发送的自定义请求头
                    headers: {'Content-Type': 'multipart/form-data'}
                }).then(res => {
                    this.createNewDiagram(res.data.data)
                }).catch(error => {
                    console.log("error", error);
                })
            },
            reset() {
                //弹出框
                this.form = {
                    name: undefined,
                    term: undefined,
                    scope: undefined,
                }
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
                            //获取当前操作的xml信息
                            const bpmnjs = that.bpmnModeler;
                            let elementRegistry = bpmnjs.get("elementRegistry");
                            let shape = e.element ? elementRegistry.get(e.element.id) : e.shape;
                            that.elementShape = shape
                            //任务节点
                            if (shape.type === "bpmn:UserTask") {
                                console.log("task", e.element);
                                that.reset()
                                //给表单赋值
                                that.form.name = shape.businessObject.name
                                //人
                                let attrs = shape.businessObject.$attrs
                                console.log("attrs", attrs);
                                //如果选了 就设置
                                let stringSttrs = JSON.stringify(attrs)
                                if (stringSttrs.includes("activiti:assignee") && !stringSttrs.includes("$")) {
                                    that.form.scope = attrs["activiti:assignee"]
                                }
                            }
                            //任务节点
                            if (shape.type === "bpmn:SquenceFlow") {
                                console.log("task", e.element);
                            }
                        } else if (eventType === "interactionEvents.updateHit") {
                            console.log("interactionEvents.updateHit", e.element);
                        } else if (eventType === "directEditing.complete") {
                            console.log("directEditing.complete", e.element);
                        }
                    });
                });
            },
            // 操作Input
            handInput() {
                let that = this
                //任务节点
                if (that.elementShape.type === "bpmn:UserTask") {
                    const modeling = that.bpmnModeler.get("modeling");
                    modeling.updateProperties(that.elementShape, {
                        name: that.form.name,
                        isInterrupting: true,
                    });
                }
                //箭头节点
                if (that.elementShape.type === "SquenceFlow") {
                    this.bpmnModeler.saveXML({format: true}, function (err, xml) {
                        let id = that.elementShape.id
                        that.xmlStr2json(xml, id)
                    });
                }
            },
            //操作选择器
            handSelect() {
                let that =this
                //任务节点
                if (that.elementShape.type === "bpmn:UserTask") {
                    const modeling = that.bpmnModeler.get("modeling");
                    modeling.updateProperties(that.elementShape, {
                        "activiti:assignee": that.form.scope,
                        isInterrupting: true,
                    });
                }
            },
            /**
             * 箭头节点加权限
             * @param {Object} xml
             * @id {string} 当前操作的流程的id
             */
            xmlStr2json(xml, id) {
                let obj = this.$x2js.xml2js(xml)
                for (let item of obj.definitions.process.sequenceFlow) {
                    if (id == item._id) {
                        let flow = "<conditionExpression xmlns='http://www.omg.org/spec/BPMN/20100524/MODEL' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:type='tFormalExpression'>${leave.day&gt;=3}</conditionExpression>"
                        Object.assign(item, this.$x2js.xml2js(flow))
                    }
                }
                let xmlBbj = this.$x2js.js2xml(obj)
                this.createNewDiagram(xmlBbj)
            },
            //提交服务器
            handSubmit() {
                this.$axios({
                    method: "post",
                    url: "http://192.168.1.34:7001/flow/bpmn",
                    // `headers`是要发送的自定义请求头
                    headers: {'Content-Type': 'application/json;charset=UTF-8'},
                    data: {xmlStr: this.XML}
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
