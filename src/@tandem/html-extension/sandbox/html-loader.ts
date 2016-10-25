import {
  Bundle,
  IBundleLoader,
  IBundleContent,
  loadBundleContent,
  IBundleLoaderResult,
} from "@tandem/sandbox";

import {
  inject,
  Dependencies,
  HTML_MIME_TYPE,
  DependenciesDependency,
} from "@tandem/common";

import {
  parseMarkup,
  MarkupTextExpression,
  MarkupFragmentExpression,
  formatMarkupExpression,
  serializeMarkupExpression,
  deserializeMarkupExpression,
} from "@tandem/synthetic-browser";

export class HTMLBundleLoader implements IBundleLoader {

  @inject(DependenciesDependency.ID)
  private _dependencies: Dependencies;

  async load(bundle: Bundle, { type, content }): Promise<IBundleLoaderResult> {

    const dependencyPaths = [];
    const dependencies = this._dependencies;

    const ast = parseMarkup(content);

    await ast.accept({
      visitAttribute({ name, value, parent }) {
        // ignore redirecting tag names
        if (/src|href/.test(name) && !/^a$/i.test(parent.nodeName)) {
          dependencyPaths.push(value);
        }
      },
      visitComment(comment) { },
      visitText() { },
      visitDocumentFragment(fragment) {
        return Promise.all(fragment.childNodes.map(async (childNodes) => {
          return await childNodes.accept(this);
        }));
      },
      async visitElement(element) {

        // normalize scripts here so that we just have text/javascript and text/css
        // TODO - add source maps here.
        if (/script|style/i.test(element.nodeName) && element.childNodes.length) {
          const textNode = element.childNodes[0] as MarkupTextExpression;
          const type     = element.getAttribute("type");

          if (type) {
            const result = await loadBundleContent(bundle, {
              type: type,
              content: textNode.nodeValue
            }, dependencies);
            textNode.nodeValue = result.content;
            element.setAttribute("type", result.type);
          }
        }

        return Promise.all([...element.childNodes, ...element.attributes].map((child) => {
          return child.accept(this);
        }));
      }
    });
    return {
      ast: ast,
      type: HTML_MIME_TYPE,
      content: formatMarkupExpression(ast),
      dependencyPaths: dependencyPaths
    };
  }
}