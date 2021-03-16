<template>
    <div class="containers" ref="content">
        <div class="canvas" ref="canvas"></div>
        <div id="js-properties-panel" class="panel"></div>
    </div>
</template>

<script>
    // 引入相关的依赖
    import BpmnModeler from 'bpmn-js/lib/Modeler'
    import propertiesPanelModule from 'bpmn-js-properties-panel'
    /*  //系统默认的右侧显示框
      import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda'*/
    // 自定义的 properties-panel内容 右侧显示框
    import propertiesProviderModule from './properties-panel-extension/provider/authority';
    // 引入描述文件
    import authorityModdleDescriptor from './properties-panel-extension/descriptors/authority'

    //Provider
    import CamundaPropertiesProvider from "bpmn-js-properties-panel/lib/provider/camunda";
    //汉化
    import customTranslate from '@/utils/customTranslate/customTranslate';

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
                canvas: null
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
                this.bpmnModeler = new BpmnModeler({
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
                    ///打印得到的数据
                    console.log("res", res);
                    let bpmnXmlStr = res.data.data
                    this.createNewDiagram(bpmnXmlStr)
                }).catch(error => {
                    console.log("error", error);
                })
            },
            createNewDiagram(bpmnXmlStr) {
                // 将字符串转换成图显示出来
                this.bpmnModeler.importXML(bpmnXmlStr, (err) => {
                    if (err) {
                        // console.error(err)
                    } else {
                        // 这里是成功之后的回调, 可以在这里做一系列事情
                        this.success()
                    }
                })
            },
            success() {
                // console.log('创建成功!')
                this.addEventBusListener()
            },
            addEventBusListener() {
                const that = this;
                that.bpmnModeler.on("commandStack.changed", function () {
                    //每一次更改 都从新渲染
                    // eslint-disable-next-line no-unused-vars
                    that.saveDiagram(function (err, xml) {
                        // console.log(xml);
                    });
                });
            },
            saveDiagram(done) {
                this.bpmnModeler.saveXML({format: true}, function (err, xml) {
                    done(err, xml);
                });
            },
        },
    }
</script>

<style scoped>
    .containers {
        background-color: #ffffff;
        width: 100%;
        height: calc(100vh - 52px);
    }

    .canvas {
        width: 100%;
        height: 100%;
    }

    .panel {
        position: absolute;
        right: 0;
        top: 0;
        width: 300px;
    }
</style>
