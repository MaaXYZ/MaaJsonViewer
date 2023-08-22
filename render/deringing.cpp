#include "graph.h"

#include <algorithm>
#include <map>
#include <stdio.h>

void tarjan(int cur, int &idx, const std::vector<std::set<int>> &edges,
            std::vector<int> &idxs, std::vector<int> &lows,
            std::vector<int> &stack, std::vector<int> &instack,
            std::vector<std::vector<int>> &result) {
  idxs[cur] = idx;
  lows[cur] = idx;
  idx += 1;
  stack.push_back(cur);
  instack[cur] = 1;

  for (auto to : edges[cur]) {
    if (idxs[to] == -1) {
      tarjan(to, idx, edges, idxs, lows, stack, instack, result);
      lows[cur] = std::min(lows[cur], lows[to]);
    } else if (instack[to]) {
      lows[cur] = std::min(lows[cur], idxs[to]);
    }
  }

  if (lows[cur] == idxs[cur]) {
    int vert;
    result.push_back({});
    std::vector<int> &res = result.back();
    do {
      vert = stack.back();
      stack.pop_back();
      instack[vert] = 0;
      res.push_back(vert);
    } while (vert != cur);
  }
}

std::vector<std::vector<int>> getSCC(const Graph &edges) {
  int n = edges.size();
  int idx = 0;
  std::vector<int> idxs(n, -1);
  std::vector<int> lows(n);
  std::vector<int> instack(n);
  std::vector<int> stack(n);
  std::vector<std::vector<int>> result;
  for (int i = 0; i < n; i++) {
    if (idxs[i] == -1) {
      tarjan(i, idx, edges, idxs, lows, stack, instack, result);
    }
  }
  return result;
}

void findLoop(int cur, const Graph &edges, const Graph &erased,
              std::vector<int> &path, std::vector<int> &vis,
              std::map<std::pair<int, int>, int> &result) {
  path.push_back(cur);
  vis[cur] = 1;

  for (auto to : edges[cur]) {
    if (erased[cur].contains(to)) {
      continue;
    }
    if (vis[to]) {
      for (int i = 1; i < path.size(); i++) {
        result[std::make_pair(path[i - 1], path[i])] += 1;
      }
      result[std::make_pair(cur, to)] += 1;
    } else {
      findLoop(to, edges, erased, path, vis, result);
    }
  }

  path.pop_back();
  vis[cur] = 0;
}

Graph getFAC(const Graph &edges) {
  int n = edges.size();
  Graph result(n);

  // std::vector<int> inbound(n, 0);
  // std::vector<int> outbound(n);

  // for (int i = 0; i < n; i++) {
  //   outbound[i] = edges[i].size();
  //   for (auto to : edges[i]) {
  //     inbound[to]++;
  //   }
  // }

  auto sccs = getSCC(edges);
  for (const auto &scc : sccs) {
    if (scc.size() == 1) {
      continue;
    } else {
      auto newg = filterGraph(edges, scc);
      std::map<std::pair<int, int>, int> edgeRef;
      std::vector<int> path;
      std::vector<int> vis(n);
      int maxCount = 5;
      while (maxCount--) {
        edgeRef.clear();
        findLoop(scc[0], newg, result, path, vis, edgeRef);
        std::vector<std::pair<int, std::pair<int, int>>> es;
        for (const auto &[e, v] : edgeRef) {
          es.emplace_back(v, e);
        }
        if (es.size() == 0) {
          break;
        }
        std::sort(es.begin(), es.end());
        auto [from, to] = es.back().second;
        result[from].insert(to);
      }
    }
  }

  return result;
}
