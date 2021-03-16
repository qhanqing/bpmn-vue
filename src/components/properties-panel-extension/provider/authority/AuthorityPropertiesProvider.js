import inherits from 'inherits';

import PropertiesActivator from 'bpmn-js-properties-panel/lib/PropertiesActivator';


import idProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/IdProps';
import nameProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/NameProps';
import processProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/ProcessProps';
import linkProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/LinkProps';
import eventProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/EventProps';
import documentationProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/DocumentationProps';

import TitleProps from './parts/TitleProps';

//系统默认权限
function createGeneralTabGroups(element, bpmnFactory, canvas, elementRegistry, translate) {

    let generalGroup = {
        id: 'general',
        label: 'General',
        entries: []
    };
    idProps(generalGroup, element, translate);
    nameProps(generalGroup, element, bpmnFactory, canvas, translate);
    processProps(generalGroup, element, translate);

    let detailsGroup = {
        id: 'details',
        label: 'Details',
        entries: []
    };
    linkProps(detailsGroup, element, translate);
    eventProps(detailsGroup, element, bpmnFactory, elementRegistry, translate);

    let documentationGroup = {
        id: 'documentation',
        label: 'Documentation',
        entries: []
    };

    documentationProps(documentationGroup, element, bpmnFactory, translate);

    return [
        generalGroup,
        detailsGroup,
        documentationGroup
    ];
}

function createAuthorityTabGroups(translate,element) {
    let editAuthorityGroup = {
        id: 'edit-authority',
        label: '编辑权限',
        entries: []
    }

    // 每个属性都有自己的props方法
    TitleProps(translate,editAuthorityGroup, element);

    return [
        editAuthorityGroup
    ];
}

export default function AuthorityPropertiesProvider(
    eventBus, bpmnFactory, canvas,
    elementRegistry, translate
) {
    PropertiesActivator.call(this, eventBus);

    this.getTabs = function (element) {
        let generalTab = {
            id: 'general',
            label: 'General',
            groups: createGeneralTabGroups(element, bpmnFactory, canvas, elementRegistry, translate)
        };

        let authorityTab = {
            id: 'authority',
            label: '权限',
            groups: createAuthorityTabGroups(translate,element)
        };
        return [
            generalTab,
            authorityTab
        ];
    }
}

inherits(AuthorityPropertiesProvider, PropertiesActivator);
