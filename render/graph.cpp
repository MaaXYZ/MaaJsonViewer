#include "graph.h"

#include <stdio.h>

GraphEdges filterGraph(const GraphEdges &edges, const std::vector<int> &verts) {
  int n = edges.size();
  GraphEdges result(n);
  std::vector<int> vertBucket(n, 0);
  for (auto v : verts) {
    vertBucket[v] = 1;
  }
  for (int from = 0; from < n; from++) {
    if (!vertBucket[from]) {
      continue;
    }
    auto &es = result[from];
    for (auto to : edges[from]) {
      if (vertBucket[to]) {
        es.insert(to);
      }
    }
  }
  return result;
}

GraphEdges buildIndirectGraph(const GraphEdges &edges) {
  int n = edges.size();
  GraphEdges result(n);
  for (int from = 0; from < n; from++) {
    for (auto to : edges[from]) {
      result[from].insert(to);
      result[to].insert(from);
    }
  }
  return result;
}

void travel(int cur, const GraphEdges &edges, std::vector<int> &vis,
            std::vector<int> &verts) {
  vis[cur] = 1;
  verts.push_back(cur);
  for (auto to : edges[cur]) {
    if (!vis[to]) {
      travel(to, edges, vis, verts);
    }
  }
}

std::vector<std::vector<int>> splitGraph(const GraphEdges &edges) {
  int n = edges.size();
  std::vector<std::vector<int>> result;
  std::vector<int> vis(n, 0);
  for (int i = 0; i < n; i++) {
    if (!vis[i]) {
      std::vector<int> verts;
      travel(i, edges, vis, verts);
      result.emplace_back(verts);
    }
  }
  return result;
}