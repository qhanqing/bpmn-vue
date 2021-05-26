顺序流（sequence flow）  
  ![avatar](./img/1.png)   
  顺序流是流程中两个元素间的连接器。在流程执行过程中，一个元素被访问后，
会沿着其所有出口顺序流继续执行。这意味着BPMN 2.0的默认是并行执行的：
两个出口顺序流就会创建两个独立的、并行的执行路径。    
 用从源元素指向目标元素的箭头表示。箭头总是指向目标元素。
 在顺序流上可以定义条件（conditional sequence flow），默认行为是计算其每个出口顺序流上的条件。当条件计算为true时，选择该出口顺序流。
 条件顺序流的XML表示格式为含有conditionExpression（条件表达式）子元素的普通顺序流。
 <sequenceFlow id="flow" sourceRef="theStart" argetRef="theTask">
  <conditionExpression xsi:type="tFormalExpression">
    <![CDATA[${order.price > 100 && order.price < 250}]]>
  </conditionExpression>
 </sequenceFlow>

