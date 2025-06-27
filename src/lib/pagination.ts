export interface GqlEdge<TNode> {
  cursor: string;
  node: TNode;
}

export interface GqlPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface GqlConnection<TNode> {
  edges: GqlEdge<TNode>[];
  pageInfo: GqlPageInfo;
}

export function formatToGQLConnection<TNode>(
  items: TNode[],
  hasNextPage: boolean,
  getCursorForItem: (item: TNode) => string,
): GqlConnection<TNode> {
  const edges: GqlEdge<TNode>[] = items.map((item) => {
    return {
      cursor: getCursorForItem(item),
      node: item,
    };
  });

  const pageInfo: GqlPageInfo = {
    hasNextPage,
    endCursor: edges.length > 0 ? edges[edges.length - 1]!.cursor : null,
  };

  return {
    edges,
    pageInfo,
  };
}
