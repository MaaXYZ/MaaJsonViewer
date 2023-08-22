#pragma once
// http://leungwensen.github.io/blog/2017/a-technique-for-drawing-directed-graphs.html

#include <set>
#include <vector>

using GraphEdges = std::vector<std::set<int>>;

GraphEdges getFAC(const GraphEdges &edges);

std::vector<std::vector<int>> getNaiveLayer(const GraphEdges &edges);

GraphEdges filterGraph(const GraphEdges &edges, const std::vector<int> &verts);
GraphEdges buildIndirectGraph(const GraphEdges &edges);
std::vector<std::vector<int>> splitGraph(const GraphEdges &edges);
