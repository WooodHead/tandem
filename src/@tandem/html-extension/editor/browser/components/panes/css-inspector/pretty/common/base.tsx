import React =  require("react");
import { Workspace } from "@tandem/editor/browser";
import { MergedCSSStyleRule } from "@tandem/html-extension/editor/browser/stores";
import { ApplyFileEditRequest } from "@tandem/sandbox"
import { BaseApplicationComponent, Mutation } from "@tandem/common";
import { SyntheticHTMLElement, SyntheticCSSElementStyleRule } from "@tandem/synthetic-browser";

export abstract class BaseCSSInputComponent extends BaseApplicationComponent<{ rule: MergedCSSStyleRule, propertyName: string, workspace: Workspace }, any> {

  onChange = (newValue: any) => {
    const { rule, propertyName } = this.props;
    const target = rule.getDeclarationMainSourceRule(propertyName);
    target.style[propertyName] = newValue;
    const mutations: Mutation<any>[] = [];
    if (rule instanceof SyntheticHTMLElement) {
      const edit = rule.createEdit();
      mutations.push(...edit.mutations);
    } else if (rule instanceof SyntheticCSSElementStyleRule) {
      const edit = rule.createEdit();
      edit.setDeclaration(propertyName, newValue);
      mutations.push(...edit.mutations);
    }

    this.props.workspace.applyFileMutations(mutations);
  }

  render() {
    const { rule, propertyName } = this.props;
    const value = rule.style[propertyName];
    return this.renderInput(value, this.onChange);
  }

  abstract renderInput(value: any, onChange: (newValue) => any);
}