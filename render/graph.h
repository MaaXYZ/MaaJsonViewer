#pragma once
// http://leungwensen.github.io/blog/2017/a-technique-for-drawing-directed-graphs.html

#include <map>
#include <set>
#include <vector>

using Graph = std::vector<std::set<int>>;
using GraphWithValue = std::vector<std::map<int, int>>;

Graph getFAC(const Graph &edges);

std::vector<std::vector<int>> getNaiveLayer(const Graph &edges);
void compactLayer(const Graph &edges, std::map<int, int> &layer);
void getCompactSpanTree(const GraphWithValue &edges, std::map<int, int> &layer,
                        std::vector<std::pair<int, int>> &tree);
void optimzieLayerViaCutValue(const GraphWithValue &edges,
                              std::map<int, int> &layer,
                              std::vector<std::pair<int, int>> &tree);

void splitLongEdge(const Graph &edges, std::map<int, int> &layer,
                   Graph &newEdges, std::map<int, int> &newLayer);
void getNaiveLayerLayout(const Graph &edges, std::map<int, int> &layer,
                         std::vector<std::vector<int>> &layout);
void optimizeLayerLayoutOrder(const Graph &edges,
                              std::vector<std::vector<int>> &layout);

Graph filterGraph(const Graph &edges, const std::vector<int> &verts);
Graph buildIndirectGraph(const Graph &edges);
GraphWithValue buildIndirectTreeGraph(std::vector<std::pair<int, int>> &tree);
GraphWithValue buildIndirectGraphWithOrder(const Graph &edges);
std::vector<std::vector<int>> splitGraph(const Graph &edges);
