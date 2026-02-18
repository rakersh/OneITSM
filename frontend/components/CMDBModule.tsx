import React, { useState, useEffect, useRef } from 'react';
import { MOCK_CIS, MOCK_CMDB_GRAPH } from '../constants';
import { Card, Badge, Button } from './Shared';
import { Database, Server, Globe, Box, Network, List, LayoutGrid } from 'lucide-react';
import * as d3 from 'd3';

const CMDBModule = () => {
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
  const svgRef = useRef<SVGSVGElement>(null);

  const getIcon = (type: string) => {
    switch(type) {
      case 'Server': return Server;
      case 'Database': return Database;
      case 'Network': return Globe;
      default: return Box;
    }
  };

  useEffect(() => {
    if (viewMode === 'graph' && svgRef.current) {
      const width = svgRef.current.clientWidth;
      const height = svgRef.current.clientHeight;

      // Clear previous graph
      d3.select(svgRef.current).selectAll("*").remove();

      const svg = d3.select(svgRef.current)
        .attr("viewBox", [0, 0, width, height]);

      // Define arrow markers
      svg.append("defs").selectAll("marker")
        .data(["end"])
        .enter().append("marker")
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 25)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#94a3b8");

      const simulation = d3.forceSimulation(MOCK_CMDB_GRAPH.nodes as any)
        .force("link", d3.forceLink(MOCK_CMDB_GRAPH.links as any).id((d: any) => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(width / 2, height / 2));

      const link = svg.append("g")
        .attr("stroke", "#94a3b8")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(MOCK_CMDB_GRAPH.links)
        .join("line")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#end)");

      const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("g")
        .data(MOCK_CMDB_GRAPH.nodes)
        .join("g")
        .call(drag(simulation) as any);

      // Node circles
      node.append("circle")
        .attr("r", 20)
        .attr("fill", (d: any) => {
          switch(d.group) {
            case 'Process': return '#8b5cf6'; // Purple
            case 'Application': return '#3b82f6'; // Blue
            case 'Server': return '#64748b'; // Slate
            case 'Database': return '#f97316'; // Orange
            case 'Network': return '#22c55e'; // Green
            default: return '#94a3b8';
          }
        });

      // Node labels
      node.append("text")
        .text((d: any) => d.label)
        .attr("x", 25)
        .attr("y", 5)
        .attr("stroke", "none")
        .attr("fill", "#1e293b")
        .attr("font-size", "12px")
        .attr("font-weight", "bold");
      
      // Node type labels (small)
      node.append("text")
        .text((d: any) => d.group)
        .attr("x", 25)
        .attr("y", 20)
        .attr("stroke", "none")
        .attr("fill", "#64748b")
        .attr("font-size", "10px");

      simulation.on("tick", () => {
        link
          .attr("x1", (d: any) => d.source.x)
          .attr("y1", (d: any) => d.source.y)
          .attr("x2", (d: any) => d.target.x)
          .attr("y2", (d: any) => d.target.y);

        node
          .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
      });

      function drag(simulation: any) {
        function dragstarted(event: any) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        }

        function dragged(event: any) {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        }

        function dragended(event: any) {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        }

        return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
      }
    }
  }, [viewMode]);

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-center flex-shrink-0">
        <h2 className="text-2xl font-bold text-slate-900">Configuration Management (CMDB)</h2>
        <div className="flex bg-white rounded-lg border border-slate-200 p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <List className="w-4 h-4" /> List View
          </button>
          <button
            onClick={() => setViewMode('graph')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'graph' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Network className="w-4 h-4" /> Graph View
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <Card className="overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-900">CI Name</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Type</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Version</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Location</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Owner</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_CIS.map((ci) => {
                  const Icon = getIcon(ci.type);
                  return (
                    <tr key={ci.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{ci.name}</div>
                            <div className="text-xs text-slate-500 font-mono">{ci.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{ci.type}</td>
                      <td className="px-6 py-4 text-slate-600">{ci.version}</td>
                      <td className="px-6 py-4 text-slate-600">{ci.location}</td>
                      <td className="px-6 py-4 text-slate-600">{ci.owner}</td>
                      <td className="px-6 py-4">
                        <Badge variant={ci.status === 'Active' ? 'success' : 'neutral'}>{ci.status}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="flex-1 overflow-hidden relative bg-slate-50">
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur p-3 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Legend</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div> Business Process</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Application</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-500"></div> Server</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div> Database</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Network</div>
            </div>
          </div>
          <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing"></svg>
        </Card>
      )}
    </div>
  );
};

export default CMDBModule;
