export type TreeNode = { slug: string; title: string } | { folder: string; children: TreeNode[] };

/** List items in the shape the Explorer renders from its templates. */
export function treeHtml(nodes: TreeNode[]): string {
  return nodes
    .map((node) =>
      "folder" in node
        ? `<li><div class="folder-container nav-folder-title tree-item-self" data-folderpath="${node.folder}">` +
          `<div><button class="folder-button"><span class="folder-title">${node.folder}</span></button></div></div>` +
          `<div class="folder-outer"><ul class="content tree-item-children">${treeHtml(node.children)}</ul></div></li>`
        : `<li><a href="/${node.slug}" class="nav-file-title tree-item-self">${node.title}</a></li>`,
    )
    .join("");
}

export function explorerHtml(nodes: TreeNode[]): string {
  return (
    `<div class="explorer nav-files-container">` +
    `<button type="button" class="title-button explorer-toggle desktop-explorer"><h2>Explorer</h2></button>` +
    `<div class="explorer-content"><ul class="explorer-ul overflow">${treeHtml(nodes)}</ul></div>` +
    `</div>`
  );
}
