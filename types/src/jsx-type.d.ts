import type { Expression, Node } from "acorn";
export type JSXElement = Node & {
    type: 'JSXElement';
    openingElement: JSXOpeningElement;
    closingElement?: JSXClosingElement;
    children: JSXChild[];
};
export type JSXChild = JSXElement | JSXText | JSXExpressionContainer;
export type JSXOpeningElement = Node & {
    type: 'JSXOpeningElement';
    name: JSXIdentifier;
    attributes: JSXAttribute[];
};
export type JSXClosingElement = Node & {
    type: 'JSXClosingElement';
    name: JSXIdentifier;
};
export type JSXIdentifier = Node & {
    type: 'JSXIdentifier';
    name: string;
};
export type JSXAttribute = Node & {
    type: 'JSXAttribute';
    name: JSXIdentifier;
    value: JSXAttributeValue;
};
export type JSXAttributeValue = Node & {
    type: 'JSXExpressionContainer' | 'JSXText';
    expression?: Expression;
    value?: string;
};
export type JSXText = Node & {
    type: 'JSXText';
    value: string;
};
export type JSXExpressionContainer = Node & {
    type: 'JSXExpressionContainer';
    expression: Expression;
};
export type JSXAggregateNodeType = JSXElement | JSXText | JSXExpressionContainer | JSXIdentifier | JSXAttribute | JSXClosingElement | JSXOpeningElement | JSXAttributeValue | JSXChild;
