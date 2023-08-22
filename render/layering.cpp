#include "graph.h"

std::vector<std::vector<int>> getNaiveLayer(const Graph &edges) {
  int n = edges.size();
  std::vector<int> inbound(n, 0);
  for (int i = 0; i < n; i++) {
    for (auto to : edges[i]) {
      inbound[to] += 1;
    }
  }

  std::vector<int> next;
  std::vector<std::vector<int>> result;
  for (int i = 0; i < n; i++) {
    if (inbound[i] == 0) {
      next.push_back(i);
    }
  }
  do {
    result.push_back(next);
    const auto &order = result.back();
    next.clear();

    int ptr = 0;
    while (ptr < order.size()) {
      int from = order[ptr++];
      for (auto to : edges[from]) {
        int &v = inbound[to];
        v -= 1;
        if (v == 0) {
          next.push_back(to);
        }
      }
    }
  } while (next.size() > 0);
  return result;
}

void travelOnlyCompactEdge(int cur, std::vector<int> &vis,
                           const GraphWithValue &edges,
                           std::map<int, int> &layer) {
  vis[cur] = 1;
  for (auto [to, dir] : edges[cur]) {
    if (!vis[to] && std::abs(layer[cur] - layer[to]) == 1) {
      travelOnlyCompactEdge(to, vis, edges, layer);
    }
  }
}

int countCompactEdgeTree(int start, const GraphWithValue &edges,
                         std::map<int, int> &layer, std::vector<int> &vis) {
  std::vector<int>(edges.size(), 0).swap(vis);
  travelOnlyCompactEdge(start, vis, edges, layer);
  int sum = 0;
  for (int i = 0; i < edges.size(); i++) {
    sum += vis[i];
  }
  return sum;
}

void compactLayer(const Graph &edges, std::map<int, int> &layer) {
  int n = edges.size();
  int startVert = 0;
  auto ig = buildIndirectGraphWithOrder(edges);
  std::vector<int> vis;

  while (countCompactEdgeTree(startVert, ig, layer, vis) < n) {
    int miniDis = n + 1;
    int findFrom = -1, findTo = -1;

    for (int i = 0; i < n; i++) {
      if (!vis[i]) {
        continue;
      }
      for (auto [j, dir] : ig[i]) {
        if (vis[j]) {
          continue;
        }
        int dis = std::abs(layer[i] - layer[j]);
        if (dis < miniDis) {
          miniDis = dis;
          if (dir == 1) {
            findFrom = i;
            findTo = j;
          } else {
            findFrom = j;
            findTo = i;
          }
        }
      }
    }
    if (vis[findFrom]) {
      layer[findTo] = layer[findFrom] + 1;
    } else {
      layer[findFrom] = layer[findTo] - 1;
    }
  }
}
