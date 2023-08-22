#include "graph.h"
#include <emscripten.h>
#include <emscripten/bind.h>
#include <set>
#include <stdio.h>
#include <vector>

template <typename T>
std::vector<T> convertToVector(const emscripten::val &arr) {
  std::vector<T> vec;
  for (size_t i = 0; i < arr["length"].as<size_t>(); ++i) {
    vec.push_back(arr[i].as<T>());
  }
  return vec;
}

void dumpGraph(const GraphEdges &edges) {
  int n = edges.size();
  printf("dump graph begin\n");
  for (int i = 0; i < n; i++) {
    for (auto j : edges[i]) {
      printf("%d -> %d\n", i, j);
    }
  }
  printf("dump graph end\n");
}

void layoutGraph(int n, const emscripten::val &v_edges,
                 const emscripten::val &v_names) {
  auto edgeVerts = convertToVector<int>(v_edges);
  auto names = convertToVector<std::string>(v_names);
  std::vector<std::set<int>> edges(n);

  for (int idx = 0; idx + 1 < edgeVerts.size(); idx += 2) {
    int from = edgeVerts[idx];
    int to = edgeVerts[idx + 1];
    if (from < 0 || from >= n || to < 0 || to >= n) {
      continue;
    }
    if (from == to) {
      continue;
    }
    edges[from].insert(to);
  }

  auto fac = getFAC(edges);
  for (int from = 0; from < n; from++) {
    for (auto to : fac[from]) {
      printf("revert %d -> %d\n", from, to);
      edges[from].erase(to);
      edges[to].insert(from);
    }
  }

  auto vertsGroups = splitGraph(buildIndirectGraph(edges));

  for (const auto &toMain : vertsGroups) {
    int m = toMain.size();
    std::vector<int> toSub(n, -1);
    for (int i = 0; i < m; i++) {
      toSub[toMain[i]] = i;
    }
    GraphEdges subGraph(m);
    for (auto from : toMain) {
      for (auto to : edges[from]) {
        subGraph[toSub[from]].insert(toSub[to]);
      }
    }

    auto initLayers = getNaiveLayer(subGraph);

    int level = 0;
    for (const auto &layer : initLayers) {
      printf("%d:", level++);
      for (auto v : layer) {
        printf(" %s", names[toMain[v]].c_str());
      }
      puts("");
    }
  }
}

EMSCRIPTEN_BINDINGS(my_module) {
  emscripten::function("layoutGraph", layoutGraph);
}
