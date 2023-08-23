#include "graph.h"

#include <stdio.h>

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
    int delta;
    if (vis[findFrom]) {
      delta = layer[findTo] - (layer[findFrom] + 1);
    } else {
      delta = layer[findFrom] - (layer[findTo] - 1);
    }
    for (int i = 0; i < n; i++) {
      if (vis[i]) {
        layer[i] += delta;
      }
    }
  }

  int minLayer = layer[0];
  for (auto [v, l]: layer) {
    if (l < minLayer) {
      minLayer = l;
    }
  }
  for (auto& [v, l]: layer) {
    l -= minLayer;
  }
}

void travelCompactTree(int cur, std::vector<int> &vis,
                       const GraphWithValue &edges, std::map<int, int> &layer,
                       std::vector<std::pair<int, int>> &tree) {
  vis[cur] = 1;
  for (auto [to, dir] : edges[cur]) {
    if (!vis[to] && std::abs(layer[cur] - layer[to]) == 1) {
      if (dir == 1) {
        tree.emplace_back(cur, to);
      } else {
        tree.emplace_back(to, cur);
      }
      travelCompactTree(to, vis, edges, layer, tree);
    }
  }
}

void getCompactSpanTree(const GraphWithValue &edges, std::map<int, int> &layer,
                        std::vector<std::pair<int, int>> &tree) {
  int n = edges.size();
  int startVert = 0;
  std::vector<int> vis(n, 0);
  travelCompactTree(startVert, vis, edges, layer, tree);
  if (tree.size() != n - 1) {
    puts("Bad span tree created!");
  }
}

void findHeadVerts(int cur, const GraphWithValue &tree, int tail,
                   std::vector<int> &verts) {
  verts[cur] = 1;
  for (auto [to, dir] : tree[cur]) {
    if (to == tail) {
      continue;
    }
    findHeadVerts(to, tree, tail, verts);
  }
}

int caculateCutValue(const GraphWithValue &edges, const GraphWithValue &tree,
                     int head, int tail) {
  int n = edges.size();
  std::vector<int> isHeadVerts(n, 0);
  findHeadVerts(head, tree, tail, isHeadVerts);
  int sum = 0;
  for (int i = 0; i < n; i++) {
    for (auto [j, dir] : edges[i]) {
      if (isHeadVerts[i] != isHeadVerts[j]) {
        sum += dir;
      }
    }
  }
  return sum;
}

std::vector<std::pair<int, std::pair<int, int>>>
caculateAllCutValue(const GraphWithValue &edges,
                    std::vector<std::pair<int, int>> &tree) {
  auto tg = buildIndirectTreeGraph(tree);
  std::vector<std::pair<int, std::pair<int, int>>> result;
  for (auto [f, t] : tree) {
    int cv = caculateCutValue(edges, tg, f, t);
    result.emplace_back(cv, std::make_pair(f, t));
  }
  return result;
}

void optimzieLayerViaCutValue(const GraphWithValue &edges,
                              std::map<int, int> &layer,
                              std::vector<std::pair<int, int>> &tree) {
  auto cvs = caculateAllCutValue(edges, tree);
  std::sort(cvs.begin(), cvs.end());
  cvs.erase(std::remove_if(cvs.begin(), cvs.end(),
                           [](const std::pair<int, std::pair<int, int>> &pr) {
                             return pr.first >= 0;
                           }),
            cvs.end());
  for (auto [cv, e] : cvs) {
    printf("edge %d -> %d cut value %d\n", e.first, e.second, cv);
  }
  // TODO: optimize it
}