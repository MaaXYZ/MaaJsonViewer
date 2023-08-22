#include "graph.h"

std::vector<std::vector<int>> getNaiveLayer(const GraphEdges &edges) {
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