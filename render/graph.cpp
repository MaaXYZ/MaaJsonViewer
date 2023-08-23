#include "graph.h"

#include <stdio.h>

Graph filterGraph(const Graph &edges, const std::vector<int> &verts) {
  int n = edges.size();
  Graph result(n);
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

Graph buildIndirectGraph(const Graph &edges) {
  int n = edges.size();
  Graph result(n);
  for (int from = 0; from < n; from++) {
    for (auto to : edges[from]) {
      result[from].insert(to);
      result[to].insert(from);
    }
  }
  return result;
}

GraphWithValue buildIndirectGraphWithOrder(const Graph &edges) {
  int n = edges.size();
  GraphWithValue result(n);
  for (int from = 0; from < n; from++) {
    for (auto to : edges[from]) {
      result[from][to] = 1;
      result[to][from] = -1;
    }
  }
  return result;
}

GraphWithValue buildIndirectTreeGraph(std::vector<std::pair<int, int>> &tree) {
  int n = tree.size() + 1;
  GraphWithValue result(n);
  for (auto [f, t] : tree) {
    result[f].emplace(t, 1);
    result[t].emplace(f, -1);
  }
  return result;
}

void travel(int cur, const Graph &edges, std::vector<int> &vis,
            std::vector<int> &verts) {
  vis[cur] = 1;
  verts.push_back(cur);
  for (auto to : edges[cur]) {
    if (!vis[to]) {
      travel(to, edges, vis, verts);
    }
  }
}

std::vector<std::vector<int>> splitGraph(const Graph &edges) {
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