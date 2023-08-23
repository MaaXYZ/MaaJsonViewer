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

void dumpGraph(const Graph &edges) {
  int n = edges.size();
  printf("dump graph begin\n");
  for (int i = 0; i < n; i++) {
    for (auto j : edges[i]) {
      printf("%d -> %d\n", i, j);
    }
  }
  printf("dump graph end\n");
}

emscripten::val layoutGraph(int n, const emscripten::val &v_edges,
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

  emscripten::val result = emscripten::val::object();
  emscripten::val vertResult = emscripten::val::array();
  emscripten::val edgeResult = emscripten::val::array();
  result.set("vert", vertResult);
  result.set("edge", edgeResult);

  int extraAllocVert = n;

  for (const auto &toMain : vertsGroups) {
    int m = toMain.size();
    std::vector<int> toSub(n, -1);
    for (int i = 0; i < m; i++) {
      toSub[toMain[i]] = i;
    }
    Graph subGraph(m);
    for (auto from : toMain) {
      for (auto to : edges[from]) {
        subGraph[toSub[from]].insert(toSub[to]);
      }
    }

    auto initLayers = getNaiveLayer(subGraph);
    std::map<int, int> layer;
    for (int i = 0; i < initLayers.size(); i++) {
      for (auto v : initLayers[i]) {
        layer[v] = i;
      }
    }
    compactLayer(subGraph, layer);
    auto subIndirectGraph = buildIndirectGraphWithOrder(subGraph);
    std::vector<std::pair<int, int>> tree;
    getCompactSpanTree(subIndirectGraph, layer, tree);
    // optimzieLayerViaCutValue(subIndirectGraph, layer, tree);

    Graph splittedGraph;
    std::map<int, int> splittedLayer;
    splitLongEdge(subGraph, layer, splittedGraph, splittedLayer);

    std::vector<std::vector<int>> flatLayer;
    getNaiveLayerLayout(splittedGraph, splittedLayer, flatLayer);

    optimizeLayerLayoutOrder(splittedGraph, flatLayer);

    int mm = splittedGraph.size();
    int extraVertOffset = extraAllocVert - toMain.size();
    extraAllocVert += mm - toMain.size();

    auto tM = [&toMain, extraVertOffset](int x) {
      return x < toMain.size() ? toMain[x] : (x + extraVertOffset);
    };

    emscripten::val partVertResult = emscripten::val::array();
    for (const auto &vts : flatLayer) {
      emscripten::val row = emscripten::val::array(); // printf("%d:", lv);
      for (auto v : vts) {
        row.call<void>("push", tM(v));
      }
      partVertResult.call<void>("push", row);
    }
    vertResult.call<void>("push", partVertResult);

    emscripten::val partEdgeResult = emscripten::val::array();
    for (int i = 0; i < mm; i++) {
      for (auto j : splittedGraph[i]) {
        emscripten::val edge = emscripten::val::array();
        edge.call<void>("push", tM(i));
        edge.call<void>("push", tM(j));
        partEdgeResult.call<void>("push", edge);
      }
    }
    edgeResult.call<void>("push", partEdgeResult);
  }

  return result;
}

EMSCRIPTEN_BINDINGS(my_module) {
  emscripten::function("layoutGraph", layoutGraph);
}
