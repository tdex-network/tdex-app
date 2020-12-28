export function filterAssetsForSearch(
  assetsById: any,
  providerAssetIds: Array<string>,
  query: string,
  exclude?: string
) {
  return providerAssetIds
    .map((id) => ({ id, ...assetsById[id] }))
    .filter((asset) => asset.id != exclude)
    .filter((asset) => {
      return asset.name.toLowerCase().includes(query.toLowerCase());
    });
}
