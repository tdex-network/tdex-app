export function filterAssetsForSearch(assets: any, { query, exclude }: any) {
  return assets
    .filter((asset: any) => asset.id != exclude)
    .filter(
      (asset: any) =>
        asset.name.toLowerCase().indexOf(query?.toLowerCase() || '') !== -1
    );
}
