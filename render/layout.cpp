#include "graph.h"

#include <stdio.h>

void splitLongEdge(const Graph &edges, std::map<int, int> &layer,
                   Graph &newEdges, std::map<int, int> &newLayer) {
  int n = edges.size();
  int newVert = n;
  newEdges = edges;
  newLayer = layer;
  for (int i = 0; i < n; i++) {
    int il = layer[i];
    for (auto j : edges[i]) {
      int jl = layer[j];
      if (std::abs(il - jl) > 1) {
        newEdges[i].erase(j);
        if (il < jl) {
          int cv = i;
          for (int dl = il + 1; dl < jl; dl++) {
            int nv = newVert++;
            newLayer[nv] = dl;
            if (nv != newEdges.size()) {
              puts("err!");
            }
            newEdges.push_back({});
            newEdges[cv].insert(nv);
            cv = nv;
          }
          newEdges[cv].insert(j);
        } else {
          int cv = j;
          for (int dl = jl + 1; dl < il; dl++) {
            int nv = newVert++;
            newLayer[nv] = dl;
            if (nv != newEdges.size()) {
              puts("err!");
            }
            newEdges.push_back({});
            newEdges[cv].insert(nv);
            cv = nv;
          }
          newEdges[cv].insert(i);
        }
      }
    }
  }
}

void getNaiveLayerLayout(const Graph &edges, std::map<int, int> &layer,
                         std::vector<std::vector<int>> &layout) {
  int n = edges.size();

  int maxLayer = layer[0];
  for (int i = 0; i < n; i++) {
    for (auto [v, l] : layer) {
      if (maxLayer < l) {
        maxLayer = l;
      }
    }
  }
  std::vector<std::vector<int>>(maxLayer + 1).swap(layout);

  std::vector<int> put(n, 0);
  std::vector<int> queue;
  int ptr = 0;
  for (int i = 0; i < n; i++) {
    if (!put[i]) {
      std::vector<int>().swap(queue);
      ptr = 0;
      queue.push_back(i);
      while (ptr < queue.size()) {
        int cur = queue[ptr];
        ptr += 1;
        if (put[cur]) {
          continue;
        }

        layout[layer[cur]].push_back(cur);
        put[cur] = 1;

        for (auto to : edges[cur]) {
          if (!put[to]) {
            queue.push_back(to);
          }
        }
      }
    }
  }
}

int countCrossingRow(const Graph &edges, const std::vector<int> &up,
                     const std::vector<int> &down) {
  int sum = 0;
  for (int ltp = 0; ltp < up.size(); ltp++) {
    int lt = up[ltp];
    for (auto rb : edges[lt]) {
      int ridx = std::find(down.begin(), down.end(), rb) - down.begin();
      for (int rtp = ltp + 1; rtp < up.size(); rtp++) {
        int rt = up[rtp];
        for (auto lb : edges[rt]) {
          int lidx = std::find(down.begin(), down.end(), lb) - down.begin();
          if (lidx < ridx) {
            sum++;
          }
        }
      }
    }
  }
  return sum;
}

int countCrossing(const Graph &edges, std::vector<std::vector<int>> &layout) {
  int counter = 0;
  for (int i = 0; i + 1 < layout.size(); i++) {
    counter += countCrossingRow(edges, layout[i], layout[i + 1]);
  }
  return counter;
}

bool sortAccordingMedian(const Graph &edges,
                         std::vector<std::vector<int>> &layout) {
  bool changed = false;
  for (int i = 1; i < layout.size(); i++) {
    int n = layout[i].size();
    std::vector<double> median(n);
    for (int c = 0; c < n; c++) {
      int cv = layout[i][c];
      std::vector<int> prevPos;
      for (int p = 0; p < layout[i - 1].size(); p++) {
        if (edges[layout[i - 1][p]].contains(cv)) {
          prevPos.push_back(p);
        }
      }
      if (prevPos.size() == 0) {
        median[c] = -1;
      } else if (prevPos.size() % 2 == 1) {
        median[c] = prevPos[prevPos.size() / 2];
      } else {
        median[c] =
            (prevPos[prevPos.size() / 2] + prevPos[prevPos.size() / 2 + 1]) /
            2.0;
      }
    }
    std::vector<std::pair<double, int>> needSort;
    for (int j = 0; j < n; j++) {
      if (median[j] != -1) {
        needSort.emplace_back(median[j], layout[i][j]);
        // printf("%d(%.1f) ", layout[i][j], median[j]);
      } else {
        // printf("[%d] ", layout[i][j]);
      }
    }
    // puts("");
    std::sort(needSort.begin(), needSort.end());
    int ptr = 0;
    for (int j = 0; j < n; j++) {
      if (median[j] != -1) {
        int nv = needSort[ptr++].second;
        if (layout[i][j] != nv) {
          changed = true;
        }
        layout[i][j] = nv;
        // printf("%d(%.1f) ", layout[i][j], needSort[ptr - 1].first);
      } else {
        // printf("[%d] ", layout[i][j]);
      }
    }
    // puts("");
  }
  return changed;
}

bool transposeIfNeeded(const Graph &edges,
                       std::vector<std::vector<int>> &layout) {
  bool improved = true;
  bool changed = false;
  while (improved) {
    improved = false;
    for (int i = 0; i + 1 < layout.size(); i++) {
      const auto &up = layout[i];
      auto &down = layout[i + 1];
      for (int j = 0; j + 1 < down.size(); j++) {
        std::vector<int> fakeDown = {down[j], down[j + 1]};
        int prev = countCrossingRow(edges, up, fakeDown);
        std::swap(fakeDown[0], fakeDown[1]);
        int post = countCrossingRow(edges, up, fakeDown);
        if (post < prev) {
          printf("down: %d -> %d\n", prev, post);
          std::swap(down[j], down[j + 1]);
          improved = true;
          changed = true;
        }
      }
    }
  }
  return changed;
}

bool transposeIfNeededUpside(const Graph &edges,
                             std::vector<std::vector<int>> &layout) {
  bool improved = true;
  bool changed = false;
  while (improved) {
    improved = false;
    for (int i = layout.size() - 1; i > 1; i--) {
      const auto &down = layout[i];
      auto &up = layout[i - 1];
      for (int j = 0; j + 1 < up.size(); j++) {
        std::vector<int> fakeUp = {up[j], up[j + 1]};
        int prev = countCrossingRow(edges, fakeUp, down);
        std::swap(fakeUp[0], fakeUp[1]);
        int post = countCrossingRow(edges, fakeUp, down);
        if (post < prev) {
          printf("up: %d -> %d\n", prev, post);
          std::swap(up[j], up[j + 1]);
          improved = true;
          changed = true;
        }
      }
    }
  }
  return changed;
}

void optimizeLayerLayoutOrder(const Graph &edges,
                              std::vector<std::vector<int>> &layout) {
  constexpr int MaxiIterations = 12;
  std::vector<std::vector<int>> bestLayout = layout;
  int bestCross = countCrossing(edges, bestLayout);
  for (int i = 0; i < MaxiIterations; i++) {
    bool changed = sortAccordingMedian(edges, layout);
    changed = transposeIfNeeded(edges, layout) || changed;
    changed = transposeIfNeededUpside(edges, layout) || changed;
    int newCross = countCrossing(edges, layout);
    if (newCross < bestCross) {
      printf("optimize crossing %d -> %d\n", bestCross, newCross);
      bestLayout = layout;
      bestCross = newCross;
    } else if (!changed) {
      printf("stop optimize turn after %d due to no change\n", i);
      break;
    }
  }
  layout.swap(bestLayout);
}